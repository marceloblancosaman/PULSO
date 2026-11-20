import type { Exercise } from './db'

/**
 * Catálogo base. Regla de nombres: español cuando así se usa en el gimnasio,
 * inglés cuando ese es el nombre habitual (Smith, hack, pec deck, hip thrust).
 * Los alias permiten encontrar cada ejercicio por cualquiera de sus nombres.
 *
 * photo: carpeta del ejercicio en Free Exercise DB (dominio público). Las fotos se
 * copian a /public/ex/<id>-0.webp y -1.webp con scripts/fotos.sh.
 * measure 'time': se registra en segundos (isométricos). unilateral: por lado (izq./der.).
 */
type Seed = Omit<Exercise, 'aliases'> & { aliases?: string[]; photo?: string }

const seed: Seed[] = [
  // ---- Pecho
  { id: 'press-banca', name: 'Press de banca', muscle: 'Pecho', equipment: 'Barra', aliases: ['bench press', 'press plano', 'banca'], alternatives: ['press-pecho-maquina', 'press-mancuernas'], photo: 'Barbell_Bench_Press_-_Medium_Grip' },
  { id: 'press-banca-abierto', name: 'Press de banca agarre abierto', muscle: 'Pecho', equipment: 'Barra', aliases: ['wide grip bench press', 'banca abierta'], photo: 'Wide-Grip_Barbell_Bench_Press' },
  { id: 'press-inclinado-barra', name: 'Press inclinado con barra', muscle: 'Pecho', equipment: 'Barra', aliases: ['incline bench press', 'press inclinado'], alternatives: ['press-inclinado-mancuernas', 'press-inclinado-smith'], photo: 'Barbell_Incline_Bench_Press_-_Medium_Grip' },
  { id: 'press-declinado', name: 'Press declinado', muscle: 'Pecho', equipment: 'Barra', aliases: ['decline bench press'], photo: 'Decline_Barbell_Bench_Press' },
  { id: 'press-mancuernas', name: 'Press con mancuernas', muscle: 'Pecho', equipment: 'Mancuernas', aliases: ['dumbbell press', 'press plano mancuernas'], alternatives: ['press-banca', 'press-pecho-maquina'], photo: 'Dumbbell_Bench_Press' },
  { id: 'press-mancuernas-neutro', name: 'Press con mancuernas agarre neutro', muscle: 'Pecho', equipment: 'Mancuernas', aliases: ['neutral grip dumbbell press', 'agarre martillo'], photo: 'Dumbbell_Bench_Press_with_Neutral_Grip' },
  { id: 'press-inclinado-mancuernas', name: 'Press inclinado con mancuernas', muscle: 'Pecho', equipment: 'Mancuernas', aliases: ['incline dumbbell press'], alternatives: ['press-inclinado-barra', 'press-inclinado-smith'], photo: 'Incline_Dumbbell_Press' },
  { id: 'press-inclinado-smith', name: 'Press inclinado en Smith', muscle: 'Pecho', equipment: 'Smith', aliases: ['smith incline press'], photo: 'Smith_Machine_Incline_Bench_Press' },
  { id: 'press-pecho-maquina', name: 'Press de pecho en máquina', muscle: 'Pecho', equipment: 'Máquina', aliases: ['chest press', 'press en máquina'], alternatives: ['press-banca', 'press-mancuernas'], photo: 'Machine_Bench_Press' },
  { id: 'pec-deck', name: 'Pec deck', muscle: 'Pecho', equipment: 'Máquina', aliases: ['aperturas en máquina', 'peck deck', 'butterfly', 'mariposa'], alternatives: ['aperturas-polea', 'aperturas-mancuernas'], photo: 'Butterfly' },
  { id: 'aperturas-mancuernas', name: 'Aperturas con mancuernas', muscle: 'Pecho', equipment: 'Mancuernas', aliases: ['dumbbell fly', 'aperturas'], alternatives: ['pec-deck', 'aperturas-polea'], photo: 'Dumbbell_Flyes' },
  { id: 'aperturas-polea', name: 'Aperturas en polea', muscle: 'Pecho', equipment: 'Polea', aliases: ['cable fly', 'cruce de poleas', 'crossover'], alternatives: ['pec-deck', 'aperturas-mancuernas'], photo: 'Cable_Crossover' },
  { id: 'fondos', name: 'Fondos en paralelas', muscle: 'Pecho', equipment: 'Peso corporal', aliases: ['dips', 'fondos'], photo: 'Dips_-_Chest_Version' },
  { id: 'flexiones', name: 'Flexiones', muscle: 'Pecho', equipment: 'Peso corporal', aliases: ['push ups', 'lagartijas', 'planchas'], photo: 'Pushups' },

  // ---- Espalda
  { id: 'jalon-pecho', name: 'Jalón al pecho', muscle: 'Espalda', equipment: 'Polea', aliases: ['lat pulldown', 'polea alta', 'jalón'], alternatives: ['dominadas', 'jalon-agarre-cerrado'], photo: 'Full_Range-Of-Motion_Lat_Pulldown' },
  { id: 'jalon-abierto', name: 'Jalón agarre abierto', muscle: 'Espalda', equipment: 'Polea', aliases: ['wide grip pulldown', 'jalón abierto'], photo: 'Wide-Grip_Lat_Pulldown' },
  { id: 'jalon-supino', name: 'Jalón agarre supino', muscle: 'Espalda', equipment: 'Polea', aliases: ['underhand pulldown', 'reverse grip pulldown', 'jalón invertido'], photo: 'Underhand_Cable_Pulldowns' },
  { id: 'jalon-agarre-cerrado', name: 'Jalón con agarre cerrado', muscle: 'Espalda', equipment: 'Polea', aliases: ['close grip pulldown', 'jalón en V'], photo: 'V-Bar_Pulldown' },
  { id: 'dominadas', name: 'Dominadas', muscle: 'Espalda', equipment: 'Peso corporal', aliases: ['pull ups', 'chin ups'], alternatives: ['jalon-pecho', 'dominadas-asistidas'], photo: 'Pullups' },
  { id: 'dominadas-asistidas', name: 'Dominadas asistidas', muscle: 'Espalda', equipment: 'Máquina', aliases: ['assisted pull ups'], photo: 'Band_Assisted_Pull-Up' },
  { id: 'remo-sentado', name: 'Remo sentado en polea', muscle: 'Espalda', equipment: 'Polea', aliases: ['seated cable row', 'remo en polea baja', 'remo sentado'], alternatives: ['remo-maquina', 'remo-mancuerna'], photo: 'Seated_Cable_Rows' },
  { id: 'remo-barra', name: 'Remo con barra', muscle: 'Espalda', equipment: 'Barra', aliases: ['barbell row', 'remo inclinado'], alternatives: ['remo-mancuerna', 'remo-t'], photo: 'Bent_Over_Barbell_Row' },
  { id: 'remo-barra-supino', name: 'Remo con barra agarre supino', muscle: 'Espalda', equipment: 'Barra', aliases: ['reverse grip row', 'remo invertido', 'remo yates'], photo: 'Reverse_Grip_Bent-Over_Rows' },
  { id: 'remo-mancuerna', name: 'Remo con mancuerna', muscle: 'Espalda', equipment: 'Mancuernas', unilateral: true, aliases: ['dumbbell row', 'remo a una mano', 'serrucho'], photo: 'One-Arm_Dumbbell_Row' },
  { id: 'remo-dos-mancuernas', name: 'Remo con dos mancuernas', muscle: 'Espalda', equipment: 'Mancuernas', aliases: ['bent over dumbbell row'], photo: 'Bent_Over_Two-Dumbbell_Row' },
  { id: 'remo-t', name: 'Remo en T', muscle: 'Espalda', equipment: 'Barra', aliases: ['t-bar row', 'remo landmine'], photo: 'T-Bar_Row_with_Handle' },
  { id: 'remo-maquina', name: 'Remo en máquina', muscle: 'Espalda', equipment: 'Máquina', aliases: ['machine row', 'remo hammer'], alternatives: ['remo-sentado', 'remo-mancuerna'], photo: 'Leverage_Iso_Row' },
  { id: 'pullover-polea', name: 'Pullover en polea', muscle: 'Espalda', equipment: 'Polea', aliases: ['straight arm pulldown', 'pullover'], photo: 'Straight-Arm_Pulldown' },
  { id: 'peso-muerto', name: 'Peso muerto', muscle: 'Espalda', equipment: 'Barra', aliases: ['deadlift'], photo: 'Barbell_Deadlift' },
  { id: 'hiperextensiones', name: 'Hiperextensiones', muscle: 'Espalda', equipment: 'Peso corporal', aliases: ['back extension', 'lumbares'], photo: 'Hyperextensions_Back_Extensions' },
  { id: 'colgarse-barra', name: 'Colgarse de la barra', muscle: 'Espalda', equipment: 'Peso corporal', measure: 'time', aliases: ['dead hang', 'colgado', 'suspensión'] },

  // ---- Piernas
  { id: 'sentadilla', name: 'Sentadilla', muscle: 'Piernas', equipment: 'Barra', aliases: ['squat', 'back squat', 'sentadilla libre'], alternatives: ['sentadilla-smith', 'prensa'], photo: 'Barbell_Squat' },
  { id: 'sentadilla-frontal', name: 'Sentadilla frontal', muscle: 'Piernas', equipment: 'Barra', aliases: ['front squat'], photo: 'Front_Barbell_Squat' },
  { id: 'sentadilla-smith', name: 'Sentadilla en Smith', muscle: 'Piernas', equipment: 'Smith', aliases: ['smith squat'], alternatives: ['sentadilla', 'hack'], photo: 'Smith_Machine_Squat' },
  { id: 'sentadilla-goblet', name: 'Sentadilla goblet', muscle: 'Piernas', equipment: 'Mancuernas', aliases: ['goblet squat'], photo: 'Goblet_Squat' },
  { id: 'sentadilla-bulgara', name: 'Sentadilla búlgara', muscle: 'Piernas', equipment: 'Mancuernas', unilateral: true, aliases: ['bulgarian squat', 'bulgarian split squat', 'búlgara'], alternatives: ['zancadas'], photo: 'Split_Squat_with_Dumbbells' },
  { id: 'hack', name: 'Hack', muscle: 'Piernas', equipment: 'Máquina', aliases: ['hack squat', 'sentadilla hack'], alternatives: ['prensa', 'sentadilla-smith'], photo: 'Hack_Squat' },
  { id: 'prensa', name: 'Prensa de piernas', muscle: 'Piernas', equipment: 'Máquina', aliases: ['leg press', 'prensa 45', 'prensa'], alternatives: ['hack', 'sentadilla-smith'], photo: 'Leg_Press' },
  { id: 'extension-cuadriceps', name: 'Extensión de cuádriceps', muscle: 'Piernas', equipment: 'Máquina', aliases: ['leg extension', 'extensiones'], photo: 'Leg_Extensions' },
  { id: 'curl-femoral-acostado', name: 'Curl femoral acostado', muscle: 'Piernas', equipment: 'Máquina', aliases: ['lying leg curl', 'femoral'], alternatives: ['curl-femoral-sentado'], photo: 'Lying_Leg_Curls' },
  { id: 'curl-femoral-sentado', name: 'Curl femoral sentado', muscle: 'Piernas', equipment: 'Máquina', aliases: ['seated leg curl'], alternatives: ['curl-femoral-acostado'], photo: 'Seated_Leg_Curl' },
  { id: 'peso-muerto-rumano', name: 'Peso muerto rumano', muscle: 'Piernas', equipment: 'Barra', aliases: ['romanian deadlift', 'RDL', 'rumano'], photo: 'Romanian_Deadlift' },
  { id: 'zancadas', name: 'Zancadas', muscle: 'Piernas', equipment: 'Mancuernas', unilateral: true, aliases: ['lunges', 'estocadas'], photo: 'Dumbbell_Lunges' },
  { id: 'pantorrillas-pie', name: 'Elevación de pantorrillas de pie', muscle: 'Piernas', equipment: 'Máquina', aliases: ['standing calf raise', 'gemelos', 'pantorrillas'], photo: 'Standing_Calf_Raises' },
  { id: 'pantorrillas-sentado', name: 'Elevación de pantorrillas sentado', muscle: 'Piernas', equipment: 'Máquina', aliases: ['seated calf raise', 'sóleo'], photo: 'Seated_Calf_Raise' },
  { id: 'aductores', name: 'Aductores en máquina', muscle: 'Piernas', equipment: 'Máquina', aliases: ['adductor', 'aductores'], photo: 'Thigh_Adductor' },

  // ---- Isométricos de piernas (tendones)
  { id: 'sentadilla-pared', name: 'Sentadilla isométrica en pared', muscle: 'Piernas', equipment: 'Peso corporal', measure: 'time', aliases: ['wall sit', 'silla', 'isométrico', 'isometrico'] },
  { id: 'sentadilla-pared-una-pierna', name: 'Sentadilla en pared a una pierna', muscle: 'Piernas', equipment: 'Peso corporal', measure: 'time', unilateral: true, aliases: ['single leg wall sit', 'isométrico', 'isometrico'] },
  { id: 'sentadilla-espanola', name: 'Sentadilla española', muscle: 'Piernas', equipment: 'Otro', measure: 'time', aliases: ['spanish squat', 'sentadilla con banda', 'isométrico', 'isometrico', 'tendón rotuliano'] },
  { id: 'extension-cuadriceps-isometrica', name: 'Extensión de cuádriceps isométrica', muscle: 'Piernas', equipment: 'Máquina', measure: 'time', aliases: ['isometric leg extension', 'isométrico', 'isometrico', 'tendón rotuliano'], photo: 'Leg_Extensions' },
  { id: 'extension-una-pierna-isometrica', name: 'Extensión a una pierna isométrica', muscle: 'Piernas', equipment: 'Máquina', measure: 'time', unilateral: true, aliases: ['single leg extension hold', 'isométrico', 'isometrico'], photo: 'Single-Leg_Leg_Extension' },
  { id: 'prensa-isometrica', name: 'Prensa isométrica', muscle: 'Piernas', equipment: 'Máquina', measure: 'time', aliases: ['isometric leg press', 'isométrico', 'isometrico'], photo: 'Leg_Press' },
  { id: 'zancada-isometrica', name: 'Zancada isométrica', muscle: 'Piernas', equipment: 'Mancuernas', measure: 'time', unilateral: true, aliases: ['split squat hold', 'isométrico', 'isometrico'], photo: 'Split_Squats' },
  { id: 'talones-isometrico', name: 'Elevación de talones sostenida', muscle: 'Piernas', equipment: 'Peso corporal', measure: 'time', aliases: ['isometric calf raise', 'aquiles', 'isométrico', 'isometrico'], photo: 'Standing_Calf_Raises' },
  { id: 'talon-una-pierna-isometrico', name: 'Elevación de talón a una pierna sostenida', muscle: 'Piernas', equipment: 'Peso corporal', measure: 'time', unilateral: true, aliases: ['single leg calf hold', 'aquiles', 'isométrico', 'isometrico'], photo: 'Calf_Raise_On_A_Dumbbell' },
  { id: 'puente-femoral-isometrico', name: 'Puente femoral isométrico', muscle: 'Piernas', equipment: 'Peso corporal', measure: 'time', aliases: ['hamstring bridge hold', 'isquiotibiales', 'isométrico', 'isometrico'] },
  { id: 'copenhague', name: 'Plancha Copenhague', muscle: 'Piernas', equipment: 'Peso corporal', measure: 'time', unilateral: true, aliases: ['copenhagen plank', 'copenhague', 'aductores', 'isométrico', 'isometrico'] },

  // ---- Glúteos
  { id: 'hip-thrust', name: 'Hip thrust', muscle: 'Glúteos', equipment: 'Barra', aliases: ['empuje de cadera', 'puente de glúteo con barra'], alternatives: ['hip-thrust-maquina', 'puente-gluteo'], photo: 'Barbell_Hip_Thrust' },
  { id: 'hip-thrust-maquina', name: 'Hip thrust en máquina', muscle: 'Glúteos', equipment: 'Máquina', aliases: ['glute drive'] },
  { id: 'puente-gluteo', name: 'Puente de glúteo', muscle: 'Glúteos', equipment: 'Peso corporal', aliases: ['glute bridge'], photo: 'Butt_Lift_Bridge' },
  { id: 'puente-gluteo-sostenido', name: 'Puente de glúteo sostenido', muscle: 'Glúteos', equipment: 'Peso corporal', measure: 'time', aliases: ['glute bridge hold', 'isométrico', 'isometrico'], photo: 'Butt_Lift_Bridge' },
  { id: 'puente-una-pierna-sostenido', name: 'Puente a una pierna sostenido', muscle: 'Glúteos', equipment: 'Peso corporal', measure: 'time', unilateral: true, aliases: ['single leg glute bridge hold', 'isométrico', 'isometrico'], photo: 'Single_Leg_Glute_Bridge' },
  { id: 'abductores', name: 'Abductores en máquina', muscle: 'Glúteos', equipment: 'Máquina', aliases: ['abductor', 'abductores'], photo: 'Thigh_Abductor' },
  { id: 'patada-gluteo', name: 'Patada de glúteo en polea', muscle: 'Glúteos', equipment: 'Polea', unilateral: true, aliases: ['cable kickback', 'patada'], photo: 'One-Legged_Cable_Kickback' },
  { id: 'peso-muerto-sumo', name: 'Peso muerto sumo', muscle: 'Glúteos', equipment: 'Barra', aliases: ['sumo deadlift'], photo: 'Sumo_Deadlift' },

  // ---- Hombros
  { id: 'press-militar', name: 'Press militar', muscle: 'Hombros', equipment: 'Barra', aliases: ['overhead press', 'OHP', 'press de hombro'], alternatives: ['press-hombro-mancuernas', 'press-hombro-maquina'], photo: 'Standing_Military_Press' },
  { id: 'press-hombro-mancuernas', name: 'Press de hombro con mancuernas', muscle: 'Hombros', equipment: 'Mancuernas', aliases: ['dumbbell shoulder press'], photo: 'Dumbbell_Shoulder_Press' },
  { id: 'press-arnold', name: 'Press Arnold', muscle: 'Hombros', equipment: 'Mancuernas', aliases: ['arnold press'], photo: 'Arnold_Dumbbell_Press' },
  { id: 'press-hombro-maquina', name: 'Press de hombro en máquina', muscle: 'Hombros', equipment: 'Máquina', aliases: ['shoulder press machine'], photo: 'Machine_Shoulder_Military_Press' },
  { id: 'elevaciones-laterales', name: 'Elevaciones laterales', muscle: 'Hombros', equipment: 'Mancuernas', aliases: ['lateral raise', 'laterales', 'vuelos laterales'], alternatives: ['laterales-polea'], photo: 'Side_Lateral_Raise' },
  { id: 'laterales-polea', name: 'Elevaciones laterales en polea', muscle: 'Hombros', equipment: 'Polea', aliases: ['cable lateral raise'], photo: 'Cable_Seated_Lateral_Raise' },
  { id: 'elevaciones-frontales', name: 'Elevaciones frontales', muscle: 'Hombros', equipment: 'Mancuernas', aliases: ['front raise', 'frontales'], photo: 'Front_Dumbbell_Raise' },
  { id: 'pec-deck-inverso', name: 'Pec deck inverso', muscle: 'Hombros', equipment: 'Máquina', aliases: ['reverse pec deck', 'reverse fly', 'deltoides posterior'], photo: 'Reverse_Machine_Flyes' },
  { id: 'face-pull', name: 'Face pull', muscle: 'Hombros', equipment: 'Polea', aliases: ['jalón a la cara'], photo: 'Face_Pull' },
  { id: 'encogimientos', name: 'Encogimientos', muscle: 'Hombros', equipment: 'Mancuernas', aliases: ['shrugs', 'trapecio'], photo: 'Dumbbell_Shrug' },

  // ---- Brazos
  { id: 'curl-barra', name: 'Curl con barra', muscle: 'Brazos', equipment: 'Barra', aliases: ['barbell curl', 'curl de bíceps', 'curl supino'], alternatives: ['curl-mancuernas', 'curl-polea'], photo: 'Barbell_Curl' },
  { id: 'curl-barra-z', name: 'Curl con barra Z', muscle: 'Brazos', equipment: 'Barra', aliases: ['ez bar curl', 'barra ez', 'curl barra w'], photo: 'EZ-Bar_Curl' },
  { id: 'curl-invertido', name: 'Curl con barra agarre prono', muscle: 'Brazos', equipment: 'Barra', aliases: ['reverse curl', 'curl invertido', 'curl prono'], photo: 'Reverse_Barbell_Curl' },
  { id: 'curl-mancuernas', name: 'Curl con mancuernas', muscle: 'Brazos', equipment: 'Mancuernas', aliases: ['dumbbell curl', 'curl alterno'], photo: 'Dumbbell_Bicep_Curl' },
  { id: 'curl-martillo', name: 'Curl martillo', muscle: 'Brazos', equipment: 'Mancuernas', aliases: ['hammer curl', 'martillo'], photo: 'Hammer_Curls' },
  { id: 'curl-martillo-cuerda', name: 'Curl martillo en polea con cuerda', muscle: 'Brazos', equipment: 'Polea', aliases: ['cable hammer curl', 'rope hammer curl'], photo: 'Cable_Hammer_Curls_-_Rope_Attachment' },
  { id: 'curl-predicador', name: 'Curl predicador', muscle: 'Brazos', equipment: 'Máquina', aliases: ['preacher curl', 'curl scott', 'banco scott'], photo: 'Preacher_Curl' },
  { id: 'curl-polea', name: 'Curl en polea', muscle: 'Brazos', equipment: 'Polea', aliases: ['cable curl'], photo: 'Standing_Biceps_Cable_Curl' },
  { id: 'triceps-polea', name: 'Extensión de tríceps en polea', muscle: 'Brazos', equipment: 'Polea', aliases: ['triceps pushdown', 'jalón de tríceps', 'barra recta'], alternatives: ['press-frances', 'fondos'], photo: 'Triceps_Pushdown' },
  { id: 'triceps-cuerda', name: 'Extensión de tríceps con cuerda', muscle: 'Brazos', equipment: 'Polea', aliases: ['rope pushdown', 'tríceps con cuerda'], photo: 'Triceps_Pushdown_-_Rope_Attachment' },
  { id: 'triceps-agarre-supino', name: 'Extensión de tríceps agarre supino', muscle: 'Brazos', equipment: 'Polea', aliases: ['reverse grip pushdown', 'tríceps invertido'], photo: 'Reverse_Grip_Triceps_Pushdown' },
  { id: 'press-frances', name: 'Press francés', muscle: 'Brazos', equipment: 'Barra', aliases: ['skull crusher', 'rompecráneos'], photo: 'EZ-Bar_Skullcrusher' },
  { id: 'triceps-tras-nuca', name: 'Extensión de tríceps tras nuca', muscle: 'Brazos', equipment: 'Mancuernas', aliases: ['overhead triceps extension', 'copa'], photo: 'Standing_Dumbbell_Triceps_Extension' },
  { id: 'patada-triceps', name: 'Patada de tríceps', muscle: 'Brazos', equipment: 'Mancuernas', aliases: ['triceps kickback'], photo: 'Tricep_Dumbbell_Kickback' },
  { id: 'press-cerrado', name: 'Press de banca agarre cerrado', muscle: 'Brazos', equipment: 'Barra', aliases: ['close grip bench press'], photo: 'Close-Grip_Barbell_Bench_Press' },

  // ---- Core
  { id: 'plancha', name: 'Plancha', muscle: 'Core', equipment: 'Peso corporal', measure: 'time', aliases: ['plank', 'isométrico', 'isometrico'], photo: 'Plank' },
  { id: 'plancha-lateral', name: 'Plancha lateral', muscle: 'Core', equipment: 'Peso corporal', measure: 'time', unilateral: true, aliases: ['side plank', 'isométrico', 'isometrico'], photo: 'Side_Bridge' },
  { id: 'hollow-hold', name: 'Hollow hold', muscle: 'Core', equipment: 'Peso corporal', measure: 'time', aliases: ['hollow body', 'banana', 'isométrico', 'isometrico'] },
  { id: 'crunch', name: 'Crunch abdominal', muscle: 'Core', equipment: 'Peso corporal', aliases: ['crunch', 'abdominales'], photo: 'Crunches' },
  { id: 'crunch-polea', name: 'Crunch en polea', muscle: 'Core', equipment: 'Polea', aliases: ['cable crunch'], photo: 'Cable_Crunch' },
  { id: 'elevacion-piernas', name: 'Elevación de piernas colgado', muscle: 'Core', equipment: 'Peso corporal', aliases: ['hanging leg raise', 'elevaciones de piernas'], photo: 'Hanging_Leg_Raise' },
  { id: 'abdominal-maquina', name: 'Abdominal en máquina', muscle: 'Core', equipment: 'Máquina', aliases: ['ab crunch machine'], photo: 'Ab_Crunch_Machine' },
  { id: 'rueda-abdominal', name: 'Rueda abdominal', muscle: 'Core', equipment: 'Otro', aliases: ['ab wheel', 'rueda'], photo: 'Ab_Roller' },
  { id: 'pallof', name: 'Press Pallof', muscle: 'Core', equipment: 'Polea', aliases: ['pallof press', 'antirrotación'], photo: 'Pallof_Press' },
]

export const PHOTO_SOURCES: Record<string, string> = Object.fromEntries(seed.filter(e => e.photo).map(e => [e.id, e.photo!]))

export const CATALOG: Exercise[] = seed.map(({ photo, ...e }) => ({ ...e, aliases: e.aliases ?? [], hasPhoto: !!photo }))

export const MUSCLES = ['Pecho', 'Espalda', 'Piernas', 'Glúteos', 'Hombros', 'Brazos', 'Core'] as const
export const EQUIPMENT = ['Máquina', 'Barra', 'Mancuernas', 'Polea', 'Smith', 'Peso corporal', 'Otro'] as const

/* ---------- Rutinas sugeridas ----------
 * Series y repeticiones orientativas (segundos en los isométricos). Conviene que las revise
 * alguien con experiencia antes de recomendarlas más allá del grupo de prueba. */
export type Template = { id: string; name: string; description: string; items: { exerciseId: string; sets: number; reps: number }[] }

export const TEMPLATES: Template[] = [
  { id: 'tpl-pecho-triceps', name: 'Pecho y tríceps', description: 'Empuje clásico: pecho plano e inclinado y tríceps.', items: [
    { exerciseId: 'press-banca', sets: 4, reps: 8 }, { exerciseId: 'press-inclinado-mancuernas', sets: 3, reps: 10 },
    { exerciseId: 'pec-deck', sets: 3, reps: 12 }, { exerciseId: 'fondos', sets: 3, reps: 10 },
    { exerciseId: 'triceps-cuerda', sets: 3, reps: 12 }, { exerciseId: 'press-frances', sets: 3, reps: 10 } ] },
  { id: 'tpl-espalda-biceps', name: 'Espalda y bíceps', description: 'Jalones y remos para la espalda, y curl de bíceps.', items: [
    { exerciseId: 'jalon-pecho', sets: 4, reps: 10 }, { exerciseId: 'remo-sentado', sets: 3, reps: 10 },
    { exerciseId: 'remo-mancuerna', sets: 3, reps: 10 }, { exerciseId: 'pullover-polea', sets: 3, reps: 12 },
    { exerciseId: 'curl-barra', sets: 3, reps: 10 }, { exerciseId: 'curl-martillo', sets: 3, reps: 12 } ] },
  { id: 'tpl-piernas-gluteos', name: 'Piernas y glúteos', description: 'Cuádriceps, femorales, glúteos y pantorrillas.', items: [
    { exerciseId: 'sentadilla', sets: 4, reps: 8 }, { exerciseId: 'prensa', sets: 3, reps: 10 },
    { exerciseId: 'peso-muerto-rumano', sets: 3, reps: 10 }, { exerciseId: 'extension-cuadriceps', sets: 3, reps: 12 },
    { exerciseId: 'curl-femoral-acostado', sets: 3, reps: 12 }, { exerciseId: 'hip-thrust', sets: 3, reps: 10 },
    { exerciseId: 'pantorrillas-pie', sets: 3, reps: 15 } ] },
  { id: 'tpl-hombros-core', name: 'Hombros y core', description: 'Press, laterales y posteriores, con trabajo de core.', items: [
    { exerciseId: 'press-militar', sets: 4, reps: 8 }, { exerciseId: 'elevaciones-laterales', sets: 3, reps: 12 },
    { exerciseId: 'pec-deck-inverso', sets: 3, reps: 12 }, { exerciseId: 'face-pull', sets: 3, reps: 12 },
    { exerciseId: 'encogimientos', sets: 3, reps: 12 }, { exerciseId: 'plancha', sets: 3, reps: 40 } ] },
  { id: 'tpl-tendones-piernas', name: 'Tendones de piernas (isométricos)', description: 'Sostener posiciones para fortalecer rodillas, tobillos y cadera.', items: [
    { exerciseId: 'sentadilla-pared', sets: 4, reps: 45 }, { exerciseId: 'sentadilla-espanola', sets: 4, reps: 45 },
    { exerciseId: 'extension-cuadriceps-isometrica', sets: 5, reps: 45 }, { exerciseId: 'talones-isometrico', sets: 4, reps: 45 },
    { exerciseId: 'puente-femoral-isometrico', sets: 3, reps: 30 }, { exerciseId: 'copenhague', sets: 3, reps: 20 } ] },
]
