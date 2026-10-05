# App de dietas: modelo de datos y plan por fases

Oct 5, 2026 · @Jose

## Objetivo y alcance

Una PWA instalada en el iPhone de mi padre que le enseña qué comer cada día, registra su peso y sus paseos, y le anima a seguir.

Las dietas son siempre las que le dio el nutricionista. La app las organiza y las muestra, pero no crea menús nuevos.

Hay un único usuario, mi padre. Yo administro las dietas, que van dentro del código de la app.

Queda fuera:

- Publicar en la App Store.
- Leer datos de Apple Salud.
- Contar calorías o macronutrientes.
- Dietas inventadas por IA.

## Stack

Todo se programa desde Windows o Linux y cabe en los planes gratuitos. No hay servidor hasta la fase 4.

| Capa | Elección | Motivo |
| --- | --- | --- |
| Frontend | React, Vite y TypeScript | Muy bien soportado por Claude Code |
| Estilos | Tailwind CSS | Rápido de iterar y fácil de mantener coherente |
| PWA | vite-plugin-pwa | Genera el manifest y el service worker |
| Datos | IndexedDB con Dexie | Se guardan en el iPhone, sin cuentas ni servidor |
| Gráficas | Recharts | Suficiente para la curva de peso |
| Hosting | Vercel o Cloudflare Pages | Despliegue automático desde GitHub |
| IA (fase 4) | Función serverless del propio hosting | La clave de la API nunca llega al navegador |

No hay cuentas ni login. Los datos viven en el iPhone y la app funciona sin conexión.

Si se borra la app de la pantalla de inicio, los datos se pierden.

## Modelo de datos

Las dietas van en un archivo JSON dentro del código. Lo que hace mi padre se guarda en el iPhone, en cuatro almacenes de IndexedDB.

| Almacén | Qué guarda | Campos |
| --- | --- | --- |
| `planned_meals` | Qué toca cada fecha y si se cumplió | `date`, `meal_type`, `meal_id` (el `id` de la comida en el JSON), `done`; uno por fecha y tipo |
| `weight_entries` | Historial de peso | `date` única, `weight_kg` con un decimal |
| `activities` | Paseos y otro ejercicio | `id` automático, `date`, `type` por defecto 'andar', `minutes`, `km` con un decimal |
| `settings` | Objetivos, un solo registro | `start_weight_kg`, `target_weight_kg`, `weekly_km_goal`, `weigh_in_weekday` |

`meal_type` tiene cuatro valores: `desayuno`, `comida`, `merienda` y `cena`. Ninguna de las seis dietas incluye media mañana.

Cómo encajan las piezas:

- **Planificar la semana:** al elegir una dieta se crea un registro en `planned_meals` por cada comida de cada día.
- **Marcar una comida:** se pone `done` a true en su registro. Se marca la comida entera, no cada plato.
- **Cambiar una comida:** se sustituye `meal_id` por otra comida del mismo `meal_type`, de cualquier dieta. Las seis son de 1850, así que el cambio es equivalente.
- **Platos:** cada comida tiene uno o varios. Un plato simple lleva solo cantidad, y uno elaborado lleva ingredientes y receta.
- **Fruta:** es un plato simple. La lista de frutas equivalentes se guarda una sola vez en la app, no en cada comida.
- **Comida libre:** es un plato más, con nombre "Libre" y su cantidad.
- **Observaciones:** las notas del nutricionista van en `notes` y se muestran al ver la dieta.
- **Lista de la compra:** se copia tal cual de la página del PDF, por categorías, en `shopping_list`.
- **Progreso de peso:** (inicial − actual) / (inicial − objetivo) × 100, limitado entre 0 y 100.
- **Resúmenes de actividad:** se calculan sumando `activities`, sin guardar totales.

Formato del archivo de dietas, una entrada por PDF. Cada comida lleva un `id` fijo que no cambia entre versiones. El resumen de alérgenos del PDF no se transcribe.

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

## Pantallas

La app tiene tres pestañas en una barra inferior: Hoy, Progreso y Dietas. Se abre siempre en Hoy.

| Pantalla | Qué muestra | Qué se puede hacer |
| --- | --- | --- |
| Hoy | Las comidas del día con su hora y sus platos, y los km de la semana | Marcar una comida, ver la receta de un plato, cambiar la comida por otra, apuntar un paseo |
| Progreso | Curva de peso, porcentaje del objetivo y resúmenes de actividad | Apuntar el peso, ver el historial |
| Dietas | Las dietas disponibles y la que está activa | Ver una dieta entera, elegir la de la semana |
| Compra | Alimentos de la semana por categorías | Tachar lo que ya está comprado |
| Ajustes | Peso inicial, peso objetivo y objetivo semanal de km | Editarlos |

Compra y Ajustes no están en la barra. Se llega a Compra desde Dietas y a Ajustes desde Progreso.

Apuntar un peso o un paseo es un formulario corto que se abre sobre la pantalla, con la fecha de hoy ya puesta.

## Plan por fases

Son cinco fases y mi padre empieza a usar la app al acabar la fase 1. Cada fase se pide a Claude Code en una sesión aparte y se prueba en el iPhone antes de pasar a la siguiente.

- **Fase 0: digitalizar las dietas**
  - Poner los seis PDF en la carpeta del proyecto y pedir a Claude Code que los transcriba al formato JSON de arriba.
  - Revisar a mano cada dieta contra su PDF, sobre todo las cantidades.
  - Terminada cuando todas las dietas están en el archivo de dietas, validado.
- **Fase 1: base y pantalla Hoy**
  - Crear el proyecto, configurar la PWA y desplegarla.
  - Crear el almacenamiento local con Dexie e incluir el archivo de dietas.
  - Pantalla Dietas para elegir la dieta de la semana.
  - Pantalla Hoy con las comidas del día, sus platos y su check. Al tocar un plato se ven sus ingredientes y su receta.
  - Terminada cuando mi padre la tiene instalada y ve y marca sus comidas de hoy.
- **Fase 2: peso y actividad**
  - Formularios para apuntar peso y paseos.
  - Ajustes con peso inicial, peso objetivo y objetivo semanal de km.
  - Pantalla Progreso con la curva de peso, el porcentaje y los resúmenes de actividad.
  - Km de la semana en la pantalla Hoy.
  - Terminada cuando apunta un peso y un paseo y los ve reflejados al momento.
- **Fase 3: comodidad**
  - Cambiar una comida por otra del mismo tipo.
  - Lista de la compra semanal, la del PDF de la dieta activa.
  - Recordatorios con notificaciones push, solo si los echa en falta.
  - Terminada cuando cambia una comida y hace la compra con la lista.
- **Fase 4: asistente con IA**
  - Guardar qué alimentos le gustan y cuáles no.
  - Chat que propone la dieta de la semana o un cambio de comida según sus gustos.
  - La IA recibe la lista de comidas existentes y solo puede devolver identificadores de esa lista.
  - Terminada cuando pide un cambio escribiendo y la app lo aplica con una comida real.

## Reglas de diseño y motivación

La app tiene que poder usarse sin pensar y no debe hacerle sentir mal nunca. Estas reglas valen para todas las fases.

- **Legibilidad:** texto de 18 px como mínimo y botones de al menos 48 px de alto.
- **Una acción principal por pantalla:** lo importante se ve sin desplazarse.
- **Tres toques como máximo** para apuntar un peso, un paseo o una comida hecha.
- **Idioma y tono:** todo en español, cercano y de tú.
- **Solo mensajes positivos:** una comparación se muestra si es favorable y, si no, no se muestra nada.
- **Rachas que perdonan:** "5 de 7 días esta semana" en lugar de un contador que vuelve a cero.
- **Totales que nunca bajan:** los km acumulados desde el inicio están siempre a la vista en Progreso.
- **Peso semanal:** la app sugiere pesarse un día fijo y enseña la tendencia, no cada subida o bajada.
- **Comidas reales:** los cambios y la IA eligen siempre entre comidas del nutricionista.
