import type { Exercise } from './db'

/**
 * Catálogo base. Regla de nombres: español cuando así se usa en el gimnasio,
 * inglés cuando ese es el nombre habitual (Smith, hack, pec deck, hip thrust).
 * Los alias permiten encontrar cada ejercicio por cualquiera de sus nombres.
 */
type Seed = Omit<Exercise, 'aliases'> & { aliases?: string[] }

const seed: Seed[] = [
  // ---- Pecho
  { id: 'press-banca', name: 'Press de banca', muscle: 'Pecho', equipment: 'Barra', aliases: ['bench press', 'press plano', 'banca'], alternatives: ['press-pecho-maquina', 'press-mancuernas'] },
  { id: 'press-inclinado-barra', name: 'Press inclinado con barra', muscle: 'Pecho', equipment: 'Barra', aliases: ['incline bench press', 'press inclinado'], alternatives: ['press-inclinado-mancuernas', 'press-inclinado-smith'] },
  { id: 'press-declinado', name: 'Press declinado', muscle: 'Pecho', equipment: 'Barra', aliases: ['decline bench press'] },
  { id: 'press-mancuernas', name: 'Press con mancuernas', muscle: 'Pecho', equipment: 'Mancuernas', aliases: ['dumbbell press', 'press plano mancuernas'], alternatives: ['press-banca', 'press-pecho-maquina'] },
  { id: 'press-inclinado-mancuernas', name: 'Press inclinado con mancuernas', muscle: 'Pecho', equipment: 'Mancuernas', aliases: ['incline dumbbell press'], alternatives: ['press-inclinado-barra', 'press-inclinado-smith'] },
  { id: 'press-inclinado-smith', name: 'Press inclinado en Smith', muscle: 'Pecho', equipment: 'Smith', aliases: ['smith incline press'] },
  { id: 'press-pecho-maquina', name: 'Press de pecho en máquina', muscle: 'Pecho', equipment: 'Máquina', aliases: ['chest press', 'press en máquina'], alternatives: ['press-banca', 'press-mancuernas'] },
  { id: 'pec-deck', name: 'Pec deck', muscle: 'Pecho', equipment: 'Máquina', aliases: ['aperturas en máquina', 'peck deck', 'butterfly', 'mariposa'], alternatives: ['aperturas-polea', 'aperturas-mancuernas'] },
  { id: 'aperturas-mancuernas', name: 'Aperturas con mancuernas', muscle: 'Pecho', equipment: 'Mancuernas', aliases: ['dumbbell fly', 'aperturas'], alternatives: ['pec-deck', 'aperturas-polea'] },
  { id: 'aperturas-polea', name: 'Aperturas en polea', muscle: 'Pecho', equipment: 'Polea', aliases: ['cable fly', 'cruce de poleas', 'crossover'], alternatives: ['pec-deck', 'aperturas-mancuernas'] },
  { id: 'fondos', name: 'Fondos en paralelas', muscle: 'Pecho', equipment: 'Peso corporal', aliases: ['dips', 'fondos'] },
  { id: 'flexiones', name: 'Flexiones', muscle: 'Pecho', equipment: 'Peso corporal', aliases: ['push ups', 'lagartijas', 'planchas'] },

  // ---- Espalda
  { id: 'jalon-pecho', name: 'Jalón al pecho', muscle: 'Espalda', equipment: 'Polea', aliases: ['lat pulldown', 'polea alta', 'jalón'], alternatives: ['dominadas', 'jalon-agarre-cerrado'] },
  { id: 'jalon-agarre-cerrado', name: 'Jalón con agarre cerrado', muscle: 'Espalda', equipment: 'Polea', aliases: ['close grip pulldown', 'jalón en V'] },
  { id: 'dominadas', name: 'Dominadas', muscle: 'Espalda', equipment: 'Peso corporal', aliases: ['pull ups', 'chin ups'], alternatives: ['jalon-pecho', 'dominadas-asistidas'] },
  { id: 'dominadas-asistidas', name: 'Dominadas asistidas', muscle: 'Espalda', equipment: 'Máquina', aliases: ['assisted pull ups'] },
  { id: 'remo-sentado', name: 'Remo sentado en polea', muscle: 'Espalda', equipment: 'Polea', aliases: ['seated cable row', 'remo en polea baja', 'remo sentado'], alternatives: ['remo-maquina', 'remo-mancuerna'] },
  { id: 'remo-barra', name: 'Remo con barra', muscle: 'Espalda', equipment: 'Barra', aliases: ['barbell row', 'remo inclinado'], alternatives: ['remo-mancuerna', 'remo-t'] },
  { id: 'remo-mancuerna', name: 'Remo con mancuerna', muscle: 'Espalda', equipment: 'Mancuernas', aliases: ['dumbbell row', 'remo a una mano', 'serrucho'] },
  { id: 'remo-t', name: 'Remo en T', muscle: 'Espalda', equipment: 'Barra', aliases: ['t-bar row', 'remo landmine'] },
  { id: 'remo-maquina', name: 'Remo en máquina', muscle: 'Espalda', equipment: 'Máquina', aliases: ['machine row', 'remo hammer'], alternatives: ['remo-sentado', 'remo-mancuerna'] },
  { id: 'pullover-polea', name: 'Pullover en polea', muscle: 'Espalda', equipment: 'Polea', aliases: ['straight arm pulldown', 'pullover'] },
  { id: 'peso-muerto', name: 'Peso muerto', muscle: 'Espalda', equipment: 'Barra', aliases: ['deadlift'] },
  { id: 'hiperextensiones', name: 'Hiperextensiones', muscle: 'Espalda', equipment: 'Peso corporal', aliases: ['back extension', 'lumbares'] },

  // ---- Piernas
  { id: 'sentadilla', name: 'Sentadilla', muscle: 'Piernas', equipment: 'Barra', aliases: ['squat', 'back squat', 'sentadilla libre'], alternatives: ['sentadilla-smith', 'prensa'] },
  { id: 'sentadilla-smith', name: 'Sentadilla en Smith', muscle: 'Piernas', equipment: 'Smith', aliases: ['smith squat'], alternatives: ['sentadilla', 'hack'] },
  { id: 'sentadilla-goblet', name: 'Sentadilla goblet', muscle: 'Piernas', equipment: 'Mancuernas', aliases: ['goblet squat'] },
  { id: 'sentadilla-bulgara', name: 'Sentadilla búlgara', muscle: 'Piernas', equipment: 'Mancuernas', aliases: ['bulgarian squat', 'bulgarian split squat', 'búlgara'], alternatives: ['zancadas'] },
  { id: 'hack', name: 'Hack', muscle: 'Piernas', equipment: 'Máquina', aliases: ['hack squat', 'sentadilla hack'], alternatives: ['prensa', 'sentadilla-smith'] },
  { id: 'prensa', name: 'Prensa de piernas', muscle: 'Piernas', equipment: 'Máquina', aliases: ['leg press', 'prensa 45', 'prensa'], alternatives: ['hack', 'sentadilla-smith'] },
  { id: 'extension-cuadriceps', name: 'Extensión de cuádriceps', muscle: 'Piernas', equipment: 'Máquina', aliases: ['leg extension', 'extensiones'] },
  { id: 'curl-femoral-acostado', name: 'Curl femoral acostado', muscle: 'Piernas', equipment: 'Máquina', aliases: ['lying leg curl', 'femoral'], alternatives: ['curl-femoral-sentado'] },
  { id: 'curl-femoral-sentado', name: 'Curl femoral sentado', muscle: 'Piernas', equipment: 'Máquina', aliases: ['seated leg curl'], alternatives: ['curl-femoral-acostado'] },
  { id: 'peso-muerto-rumano', name: 'Peso muerto rumano', muscle: 'Piernas', equipment: 'Barra', aliases: ['romanian deadlift', 'RDL', 'rumano'] },
  { id: 'zancadas', name: 'Zancadas', muscle: 'Piernas', equipment: 'Mancuernas', aliases: ['lunges', 'estocadas'] },
  { id: 'pantorrillas-pie', name: 'Elevación de pantorrillas de pie', muscle: 'Piernas', equipment: 'Máquina', aliases: ['standing calf raise', 'gemelos', 'pantorrillas'] },
  { id: 'pantorrillas-sentado', name: 'Elevación de pantorrillas sentado', muscle: 'Piernas', equipment: 'Máquina', aliases: ['seated calf raise', 'sóleo'] },
  { id: 'aductores', name: 'Aductores en máquina', muscle: 'Piernas', equipment: 'Máquina', aliases: ['adductor', 'aductores'] },

  // ---- Glúteos
  { id: 'hip-thrust', name: 'Hip thrust', muscle: 'Glúteos', equipment: 'Barra', aliases: ['empuje de cadera', 'puente de glúteo con barra'], alternatives: ['hip-thrust-maquina', 'puente-gluteo'] },
  { id: 'hip-thrust-maquina', name: 'Hip thrust en máquina', muscle: 'Glúteos', equipment: 'Máquina', aliases: ['glute drive'] },
  { id: 'puente-gluteo', name: 'Puente de glúteo', muscle: 'Glúteos', equipment: 'Peso corporal', aliases: ['glute bridge'] },
  { id: 'abductores', name: 'Abductores en máquina', muscle: 'Glúteos', equipment: 'Máquina', aliases: ['abductor', 'abductores'] },
  { id: 'patada-gluteo', name: 'Patada de glúteo en polea', muscle: 'Glúteos', equipment: 'Polea', aliases: ['cable kickback', 'patada'] },
  { id: 'peso-muerto-sumo', name: 'Peso muerto sumo', muscle: 'Glúteos', equipment: 'Barra', aliases: ['sumo deadlift'] },

  // ---- Hombros
  { id: 'press-militar', name: 'Press militar', muscle: 'Hombros', equipment: 'Barra', aliases: ['overhead press', 'OHP', 'press de hombro'], alternatives: ['press-hombro-mancuernas', 'press-hombro-maquina'] },
  { id: 'press-hombro-mancuernas', name: 'Press de hombro con mancuernas', muscle: 'Hombros', equipment: 'Mancuernas', aliases: ['dumbbell shoulder press', 'press arnold'] },
  { id: 'press-hombro-maquina', name: 'Press de hombro en máquina', muscle: 'Hombros', equipment: 'Máquina', aliases: ['shoulder press machine'] },
  { id: 'elevaciones-laterales', name: 'Elevaciones laterales', muscle: 'Hombros', equipment: 'Mancuernas', aliases: ['lateral raise', 'laterales', 'vuelos laterales'], alternatives: ['laterales-polea'] },
  { id: 'laterales-polea', name: 'Elevaciones laterales en polea', muscle: 'Hombros', equipment: 'Polea', aliases: ['cable lateral raise'] },
  { id: 'elevaciones-frontales', name: 'Elevaciones frontales', muscle: 'Hombros', equipment: 'Mancuernas', aliases: ['front raise', 'frontales'] },
  { id: 'pec-deck-inverso', name: 'Pec deck inverso', muscle: 'Hombros', equipment: 'Máquina', aliases: ['reverse pec deck', 'reverse fly', 'deltoides posterior'] },
  { id: 'face-pull', name: 'Face pull', muscle: 'Hombros', equipment: 'Polea', aliases: ['jalón a la cara'] },
  { id: 'encogimientos', name: 'Encogimientos', muscle: 'Hombros', equipment: 'Mancuernas', aliases: ['shrugs', 'trapecio'] },

  // ---- Brazos
  { id: 'curl-barra', name: 'Curl con barra', muscle: 'Brazos', equipment: 'Barra', aliases: ['barbell curl', 'curl de bíceps'], alternatives: ['curl-mancuernas', 'curl-polea'] },
  { id: 'curl-mancuernas', name: 'Curl con mancuernas', muscle: 'Brazos', equipment: 'Mancuernas', aliases: ['dumbbell curl', 'curl alterno'] },
  { id: 'curl-martillo', name: 'Curl martillo', muscle: 'Brazos', equipment: 'Mancuernas', aliases: ['hammer curl', 'martillo'] },
  { id: 'curl-predicador', name: 'Curl predicador', muscle: 'Brazos', equipment: 'Máquina', aliases: ['preacher curl', 'curl scott', 'banco scott'] },
  { id: 'curl-polea', name: 'Curl en polea', muscle: 'Brazos', equipment: 'Polea', aliases: ['cable curl'] },
  { id: 'triceps-polea', name: 'Extensión de tríceps en polea', muscle: 'Brazos', equipment: 'Polea', aliases: ['triceps pushdown', 'jalón de tríceps', 'tríceps con cuerda'], alternatives: ['press-frances', 'fondos'] },
  { id: 'press-frances', name: 'Press francés', muscle: 'Brazos', equipment: 'Barra', aliases: ['skull crusher', 'rompecráneos'] },
  { id: 'triceps-tras-nuca', name: 'Extensión de tríceps tras nuca', muscle: 'Brazos', equipment: 'Mancuernas', aliases: ['overhead triceps extension', 'copa'] },
  { id: 'patada-triceps', name: 'Patada de tríceps', muscle: 'Brazos', equipment: 'Mancuernas', aliases: ['triceps kickback'] },
  { id: 'press-cerrado', name: 'Press de banca agarre cerrado', muscle: 'Brazos', equipment: 'Barra', aliases: ['close grip bench press'] },

  // ---- Core
  { id: 'plancha', name: 'Plancha', muscle: 'Core', equipment: 'Peso corporal', aliases: ['plank'] },
  { id: 'crunch', name: 'Crunch abdominal', muscle: 'Core', equipment: 'Peso corporal', aliases: ['crunch', 'abdominales'] },
  { id: 'crunch-polea', name: 'Crunch en polea', muscle: 'Core', equipment: 'Polea', aliases: ['cable crunch'] },
  { id: 'elevacion-piernas', name: 'Elevación de piernas colgado', muscle: 'Core', equipment: 'Peso corporal', aliases: ['hanging leg raise', 'elevaciones de piernas'] },
  { id: 'abdominal-maquina', name: 'Abdominal en máquina', muscle: 'Core', equipment: 'Máquina', aliases: ['ab crunch machine'] },
  { id: 'rueda-abdominal', name: 'Rueda abdominal', muscle: 'Core', equipment: 'Otro', aliases: ['ab wheel', 'rueda'] },
  { id: 'pallof', name: 'Press Pallof', muscle: 'Core', equipment: 'Polea', aliases: ['pallof press', 'antirrotación'] },
]

export const CATALOG: Exercise[] = seed.map(e => ({ ...e, aliases: e.aliases ?? [] }))

export const MUSCLES = ['Pecho', 'Espalda', 'Piernas', 'Glúteos', 'Hombros', 'Brazos', 'Core'] as const
export const EQUIPMENT = ['Máquina', 'Barra', 'Mancuernas', 'Polea', 'Smith', 'Peso corporal', 'Otro'] as const
