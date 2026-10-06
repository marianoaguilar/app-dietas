# App de dietas: modelo de datos y plan por fases

Oct 6, 2026 · @Jose

## Objetivo y alcance

Una PWA instalada en el iPhone de mi padre que le enseña qué comer cada día, registra su peso y los días que sale a andar, y le anima a seguir.

La app es cerrada: sigue una o dos dietas personalizadas que preparo yo con los días que más le gustan de las dietas del nutricionista. Cada día se coge completo, sin mezclar comidas sueltas, así que todo lo que come sigue siendo del nutricionista.

Hay un único usuario, mi padre. Yo administro las dietas, que van dentro del código de la app.

Queda fuera:

- Publicar en la App Store.
- Leer datos de Apple Salud.
- Contar calorías o macronutrientes.
- Crear días o platos que no estén en las dietas del nutricionista.
- Un asistente con IA.
- Notificaciones push.

## Stack

Todo se programa desde Windows o Linux y cabe en los planes gratuitos. No hay servidor.

| Capa | Elección | Motivo |
| --- | --- | --- |
| Frontend | React, Vite y TypeScript | Muy bien soportado por Claude Code |
| Estilos | Tailwind CSS | Rápido de iterar y fácil de mantener coherente |
| PWA | vite-plugin-pwa | Genera el manifest y el service worker |
| Datos | IndexedDB con Dexie | Se guardan en el iPhone, sin cuentas ni servidor |
| Hosting | Vercel o Cloudflare Pages | Despliegue automático desde GitHub |

No hay cuentas ni login. Los datos viven en el iPhone y la app funciona sin conexión.

Si se borra la app de la pantalla de inicio, los datos se pierden.

## Modelo de datos

Las dietas van en un archivo JSON dentro del código. Lo que hace mi padre se guarda en el iPhone, en cuatro almacenes de IndexedDB.

| Almacén | Qué guarda | Campos |
| --- | --- | --- |
| `planned_meals` | Qué toca cada fecha y si se cumplió | `date`, `meal_type`, `meal_id` (el `id` de la comida en el JSON), `done`; uno por fecha y tipo |
| `weight_entries` | Historial de peso | `date` única, `weight_kg` con un decimal |
| `activity_days` | Días que salió a hacer actividad | `date` única; no se guarda tipo, minutos ni km |
| `settings` | Objetivos y estado, un solo registro | `start_weight_kg`, `target_weight_kg`, `weigh_in_weekday`, `active_diet_id`, `rotation_start` (fecha del día 1 de la rotación), `shopping_checked` (lo tachado en la compra) |

`meal_type` tiene cuatro valores: `desayuno`, `comida`, `merienda` y `cena`. Ninguna dieta incluye media mañana.

Cómo encajan las piezas:

- **Dietas del nutricionista:** las seis transcritas de los PDF. Son la batería de la que salen los días y no se modifican.
- **Dietas personalizadas:** una o dos semanas de 7 días. Cada día apunta a un día completo de una dieta del nutricionista, en vez de copiarlo. Así es imposible que se cuele una comida inventada, y si se corrige una errata en el original, se corrige en todas.
- **Planificación automática:** al abrir la app, si faltan días planificados en los próximos 7, se crean siguiendo la rotación (A, B, A, B… si hay dos dietas) a partir de `rotation_start`. Mi padre no tiene que elegir nada.
- **Marcar una comida:** se pone `done` a true en su registro. Se marca la comida entera, no cada plato.
- **Platos:** cada comida tiene uno o varios. Un plato simple lleva solo cantidad, y uno elaborado lleva ingredientes y receta.
- **Fruta:** es un plato simple. La lista de frutas equivalentes se guarda una sola vez en la app, no en cada comida.
- **Comida libre:** es un plato más, con nombre "Libre" y su cantidad.
- **Observaciones:** las notas del nutricionista van en `notes` y se muestran al ver la dieta.
- **Lista de la compra:** en las dietas del nutricionista se copia tal cual del PDF. En las personalizadas se genera con un script sumando los ingredientes de sus 7 días, se revisa a mano y se guarda en `shopping_list`. Lo tachado se guarda en `shopping_checked` y se vacía al empezar cada semana.
- **Progreso de peso:** (inicial − actual) / (inicial − objetivo) × 100, limitado entre 0 y 100.
- **Actividad:** salir cuenta, sin importar cuánto. Marcar un día crea su registro en `activity_days` y desmarcarlo lo borra. Los días por semana y por mes se calculan contando registros.
- **Migración:** las actividades apuntadas antes de este cambio (almacén `activities`, con minutos y km) se convierten en días marcados, uno por fecha, y el almacén antiguo se elimina.

Formato de una dieta del nutricionista, una entrada por PDF. Cada comida lleva un `id` fijo que no cambia entre versiones. El resumen de alérgenos del PDF no se transcribe.

```json
{
  "id": "2025-09-05",
  "name": "Plan semanal 1850 (05-09-2025)",
  "notes": [
    "Té o infusiones, cuando quieras",
    "La verdura no hace falta pesarla"
  ],
  "days": [
    {
      "day_number": 1,
      "meals": [
        {
          "id": "2025-09-05-d1-desayuno",
          "meal_type": "desayuno",
          "time": "09:00",
          "dishes": [
            {
              "name": "Tostada de pan de centeno, aceite y tomate",
              "ingredients": [
                { "food": "Pan de centeno", "quantity": "80 g", "measure": "2 rebanadas" },
                { "food": "Aceite de oliva", "quantity": "10 g", "measure": "1 cucharada sopera" },
                { "food": "Tomate crudo", "quantity": "30 g", "measure": "2 rodajas" }
              ],
              "recipe": "Tostar el pan y añadir el aceite y el tomate en rodajas."
            },
            { "name": "Huevo de gallina", "quantity": "65 g", "measure": "1 unidad talla M" },
            { "name": "Pechuga de pavo (fiambre)", "quantity": "60 g", "measure": "5 lonchas" }
          ]
        }
      ]
    }
  ],
  "shopping_list": [
    {
      "category": "Frutas",
      "items": [
        { "food": "Arándanos", "quantity": "50 g" },
        { "food": "Limón", "quantity": "15 g" }
      ]
    }
  ]
}
```

Formato de una dieta personalizada. Cada día indica de qué dieta y de qué día sale. Las comidas y las notas se toman de ahí al cargar la app.

```json
{
  "id": "papa-a",
  "name": "Semana A",
  "custom": true,
  "days": [
    { "day_number": 1, "source": { "diet_id": "2025-09-05", "day_number": 3 } },
    { "day_number": 2, "source": { "diet_id": "2025-11-07", "day_number": 1 } }
  ],
  "shopping_list": [
    {
      "category": "Frutas",
      "items": [{ "food": "Manzana", "quantity": "450 g" }]
    }
  ]
}
```

## Pantallas

La app tiene tres pestañas en una barra inferior: Hoy, Progreso y Dietas. Se abre siempre en Hoy.

| Pantalla | Qué muestra | Qué se puede hacer |
| --- | --- | --- |
| Hoy | Las comidas del día con su hora y sus platos, y la tira de la semana con los días que ha salido | Marcar una comida, ver la receta de un plato, marcar que ha salido hoy |
| Progreso | Último peso, lo bajado desde el inicio, barra del camino hacia el objetivo y, debajo, el historial de peso; después, el calendario del mes con los días que ha salido | Apuntar el peso, ver el historial, marcar o desmarcar un día pasado, ver meses anteriores |
| Dietas | Sus dietas personalizadas, cuál toca esta semana y el acceso a la compra | Ver una dieta entera, abrir la lista de la compra |
| Compra | Alimentos de la semana por categorías | Tachar lo que ya está comprado |
| Ajustes | Peso inicial, peso objetivo y día de pesarse | Editarlos |

Compra y Ajustes no están en la barra. Se llega a Compra desde Dietas y a Ajustes desde Progreso.

Las seis dietas del nutricionista siguen en la app, pero en un apartado secundario de Dietas ("Otras dietas"), por si hace falta consultarlas.

Apuntar un peso es un formulario corto que se abre sobre la pantalla, con la fecha de hoy ya puesta.

Cómo se ve la actividad:

- **Apuntar:** un botón grande en Hoy, "He salido hoy". Un toque y el día queda marcado, con una pequeña animación del círculo rellenándose y un mensaje como "¡Bien hecho! Llevas 3 días esta semana".
- **Tira de la semana en Hoy:** arriba del todo, en una tarjeta compacta para que el desayuno empiece justo debajo, y siempre en el mismo sitio. De lunes a domingo, con el número de cada día. Círculo relleno con un check los días que salió, borde punteado en el día de hoy si aún no ha salido, gris suave en los días pasados sin salir (sin cruces ni rojo) y el número en gris claro en los que aún no han llegado.
- **Calendario del mes en Progreso:** los mismos círculos, con flechas para ver meses anteriores y debajo "12 días en octubre". Tocar un día pasado lo marca o desmarca, por si se le olvidó apuntarlo.
- **Ánimo por la tarde:** si aún no ha salido, Hoy muestra "¿Te animas a dar un paseo hoy?". Nunca "no has salido". En la tarjeta sale un solo mensaje cada vez.

## Plan por fases

Cada fase se pide a Claude Code en una sesión aparte y se prueba en el iPhone antes de pasar a la siguiente.

- **Fase 0: digitalizar las dietas** ✅
  - Transcribir los seis PDF al formato JSON de arriba y revisarlos a mano.
- **Fase 1: base y pantalla Hoy** ✅
  - Proyecto, PWA desplegada, almacenamiento con Dexie, pantallas Hoy y Dietas.
- **Fase 2: peso y actividad** ✅
  - Formularios de peso y actividad, Ajustes, pantalla Progreso y km de la semana en Hoy.
- **Fase 3: actividad como calendario**
  - Sustituir el formulario de actividad por el botón "He salido hoy" en Hoy.
  - Tira de la semana en Hoy y calendario del mes en Progreso, con días pasados que se pueden marcar o desmarcar.
  - Quitar el objetivo de km semanales, la barra de km y los totales de km.
  - Migrar las actividades ya apuntadas a días marcados.
  - Terminada cuando marca que ha salido en un toque y lo ve en la semana y en el mes.
- **Fase 4: dietas personalizadas**
  - Paso a Claude Code las dietas personalizadas ya decididas: qué día de qué dieta va en cada día de la semana.
  - Pasarlas al formato de dieta personalizada y hacer que la app las cargue.
  - Generar la lista de la compra de cada semana con un script y revisarla a mano.
  - Corregir la categoría truncada "Patatas, legumbres y frutos…" en las dietas originales.
  - Terminada cuando las dietas personalizadas están en el JSON, validadas, y se ven en la app.
- **Fase 5: planificación automática y compra**
  - La app planifica sola los próximos 7 días siguiendo la rotación.
  - Pantalla Dietas simplificada, con las seis originales en "Otras dietas".
  - Pantalla Compra con la lista de la semana que toca y casillas para tachar.
  - Terminada cuando pasa una semana sin que mi padre elija nada y hace la compra con la lista.

## Reglas de diseño y motivación

La app tiene que poder usarse sin pensar y no debe hacerle sentir mal nunca. Estas reglas valen para todas las fases.

- **Legibilidad:** texto de 18 px como mínimo y botones de al menos 48 px de alto.
- **Una acción principal por pantalla:** lo importante se ve sin desplazarse.
- **Tres toques como máximo** para apuntar un peso o una comida hecha, y uno solo para marcar que ha salido.
- **Idioma y tono:** todo en español, cercano y de tú.
- **Solo mensajes positivos:** una comparación se muestra si es favorable y, si no, no se muestra nada.
- **Rachas que perdonan:** "5 de 7 días esta semana" en lugar de un contador de días seguidos que vuelve a cero.
- **Salir es suficiente:** la actividad no tiene objetivos ni números que alcanzar. Se premia salir, no cuánto.
- **Peso semanal:** la app sugiere pesarse un día fijo. No hay gráfica de peso: se enseña lo bajado desde el inicio y la barra del camino, no cada subida o bajada.
- **Días reales:** todo lo que come sale de días completos de las dietas del nutricionista.
- **Nada que decidir:** la app sabe qué toca cada día sin que él tenga que elegir.
