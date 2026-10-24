export const SUBJECTS = [
  { id: 'maths', label: 'Mathematics', short: 'Maths', color: '#d3a46d' },
  { id: 'hindi', label: 'Hindi', short: 'हिन्दी', color: '#cc806d' },
  { id: 'physics', label: 'Physics', short: 'Physics', color: '#7ca7a0' },
  { id: 'computer', label: 'Computer Applications', short: 'Computer', color: '#8395c2' },
  { id: 'chemistry', label: 'Chemistry', short: 'Chemistry', color: '#bc8dba' },
  { id: 'biology', label: 'Biology', short: 'Biology', color: '#82a36f' },
  { id: 'history', label: 'History & Civics', short: 'His/Civics', color: '#d39a71' },
  { id: 'english-language', label: 'English Language', short: 'Eng. Language', color: '#7097aa' },
  { id: 'english-literature', label: 'English Literature', short: 'Eng. Literature', color: '#9a86aa' },
  { id: 'geography', label: 'Geography', short: 'Geography', color: '#8b9f76' },
];

const starter = [
  ['maths','Quadratic equations','Algebra','For ax² + bx + c = 0, the discriminant is D = b² − 4ac. The roots are x = (−b ± √D) / 2a. If D > 0 there are two distinct real roots; if D = 0 there is one repeated real root; if D < 0 there are no real roots.','formula'],
  ['maths','Arithmetic progressions','Sequences','For an arithmetic progression with first term a and common difference d: nth term Tₙ = a + (n − 1)d. The sum of n terms is Sₙ = n/2 [2a + (n − 1)d] = n/2 (a + l), where l is the last term. Check that consecutive differences are constant.','formula'],
  ['maths','Trigonometric identities','Trigonometry','For an acute angle θ in a right triangle: sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent. Core identities: sin²θ + cos²θ = 1; 1 + tan²θ = sec²θ; 1 + cot²θ = cosec²θ. Draw a labelled triangle before substituting values.','formula'],
  ['maths','Circle theorems','Geometry','A tangent to a circle is perpendicular to the radius at the point of contact. Tangents drawn from the same external point are equal in length. The angle subtended by a chord at the centre is twice the angle subtended by it at the circumference in the same segment. Add radii and mark equal lengths before proving a result.','concept'],

  ['hindi','औपचारिक पत्र का ढाँचा','लेखन कौशल','औपचारिक पत्र में प्रेषक का पता और दिनांक, प्राप्तकर्ता का पद/पता, विषय, संबोधन, संक्षिप्त और विनम्र मुख्य भाग, समापन तथा नाम/हस्ताक्षर लिखें। विषय स्पष्ट रखें और प्रत्येक अनुच्छेद में एक मुख्य बात रखें। प्रश्न में दिए उद्देश्य और शब्द-सीमा का पालन करें।','writing'],
  ['hindi','अपठित गद्यांश की रणनीति','पठन कौशल','पहले गद्यांश को पूरा पढ़ें और मुख्य विचार पहचानें। फिर प्रश्नों के संकेत-शब्द देखकर उत्तर गद्यांश के आधार पर अपने शब्दों में लिखें। अनुमान या बाहर की जानकारी न जोड़ें। शब्दार्थ वाले प्रश्न में संदर्भ के अनुसार अर्थ चुनें।','strategy'],
  ['hindi','निबंध लेखन','लेखन कौशल','निबंध की रूपरेखा बनाएं: भूमिका, दो या तीन क्रमबद्ध मुख्य बिंदु, उदाहरण/कारण और निष्कर्ष। विषय से न भटकें; सरल, शुद्ध वाक्य लिखें; विराम-चिह्न और वर्तनी जाँचें। दिए गए विषय और निर्देशों के अनुसार ही तथ्य चुनें।','writing'],

  ['physics','Ohm’s law and resistance','Electricity','At constant temperature, the current through a conductor is directly proportional to the potential difference across it: V = IR. Resistance R is measured in ohms (Ω). In a series circuit, resistances add: Rₛ = R₁ + R₂ + …; in parallel, 1/Rₚ = 1/R₁ + 1/R₂ + …. State units and show substitutions in numerical answers.','formula'],
  ['physics','Refraction of light','Light','Refraction is the change in direction of light as it passes between media because its speed changes. Snell’s law is n₁ sin i = n₂ sin r. Refractive index n = speed of light in vacuum / speed in the medium. A ray entering a denser medium bends toward the normal; leaving it bends away from the normal.','concept'],
  ['physics','Work, energy and power','Mechanics','Work done by a constant force along its displacement is W = Fs cos θ. Near Earth’s surface, gravitational potential energy is mgh and kinetic energy is ½mv². Power is the rate of doing work: P = W/t. Use SI units: joule (J), watt (W), kilogram (kg), metre (m), second (s).','formula'],
  ['physics','Specific heat capacity','Heat','Specific heat capacity c is the heat energy needed to raise the temperature of unit mass of a substance by one kelvin (or degree Celsius). For no change of state, Q = mcΔT. In calorimetry, heat lost by the hotter body equals heat gained by the cooler body when the system is insulated.','concept'],

  ['computer','Java primitive types and expressions','Java basics','Common Java primitive types include int (whole numbers), double (decimal values), char (one character), and boolean (true/false). Java is case-sensitive. Integer division such as 7 / 2 gives 3 when both operands are integers; use 7.0 / 2 or casting when a decimal result is needed.','code'],
  ['computer','Selection and loops','Control structures','An if / else statement selects a branch using a boolean condition. A for loop is useful when the number of repetitions is known; while repeats while its condition remains true. Trace a loop with a small table of variable values and check the boundary condition to avoid off-by-one errors.','concept'],
  ['computer','Methods and arrays','Java basics','A method declaration includes a return type, name, parameter list, and body; void means it returns no value. An array stores a fixed-size sequence of one type. Java array indexes start at 0, so the last valid index is length − 1. Check parameter types and return values when tracing a method call.','concept'],

  ['chemistry','Periodic trends','Periodic table','Across a period, atomic number increases and valence electrons are added to the same outer shell; atomic size generally decreases and metallic character generally decreases. Down a group, new shells are added, so atomic size generally increases and metallic character generally increases. Relate the trend to shell structure rather than memorising a direction alone.','concept'],
  ['chemistry','Acids, bases and salts','Acids and bases','In aqueous solution, an acid furnishes H⁺ ions and a base furnishes OH⁻ ions (Arrhenius definitions). Neutralisation can be written acid + base → salt + water. For example, HCl + NaOH → NaCl + H₂O. Balance equations and include state symbols when the question asks for them.','equation'],
  ['chemistry','Electrolysis basics','Electrochemistry','Electrolysis uses electrical energy to drive a chemical change in an electrolyte. Positive cations move to the cathode (negative electrode) and gain electrons; negative anions move to the anode (positive electrode) and lose electrons. Distinguish electrode names from their signs in an electrolytic cell.','concept'],
  ['chemistry','Covalent bonding','Chemical bonding','A covalent bond forms when atoms share one or more pairs of electrons, usually to achieve a stable outer shell. Draw a dot-and-cross diagram to show only the outer-shell electrons and the shared pair(s). A shared pair represents one covalent bond; a double bond represents two shared pairs.','concept'],

  ['biology','Photosynthesis','Plant physiology','Photosynthesis converts light energy into chemical energy in green plants. In the presence of chlorophyll and light: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Carbon dioxide enters through stomata; water is absorbed by roots; glucose can be stored as starch. The equation is a summary, not a single-step reaction.','equation'],
  ['biology','Human circulation','Human physiology','In double circulation, blood passes through the heart twice in one complete circuit: pulmonary circulation goes from heart to lungs and back; systemic circulation goes from heart to body and back. Arteries carry blood away from the heart and veins carry blood toward it; these definitions do not depend on oxygen content.','concept'],
  ['biology','Inheritance and genes','Genetics','A gene is a DNA sequence associated with a heritable characteristic; alternative forms of a gene are alleles. In a simple monohybrid cross between heterozygotes Aa × Aa, the genotype ratio is 1 AA : 2 Aa : 1 aa. A 3:1 phenotype ratio follows only when A is completely dominant over a and other simple-cross assumptions apply.','concept'],
  ['biology','Excretion in humans','Human physiology','The kidneys filter blood and form urine in nephrons. Ultrafiltration occurs at the glomerulus; useful substances and much water are selectively reabsorbed along the tubule. The ureters carry urine to the bladder and the urethra carries it out. Do not confuse the ureter with the urethra.','concept'],

  ['history','The First War of Independence (1857)','Modern Indian history','The uprising of 1857 had military, political, economic, and social causes; the cartridge issue was an immediate trigger rather than the only cause. When writing an answer, separate long-term causes from the immediate cause, then mention key events and consequences as required by the question. Check your prescribed textbook for the named leaders and regional details.','answer-guide'],
  ['history','The Indian National Congress','National movement','The Indian National Congress was founded in 1885. Early nationalist leaders used petitions, resolutions, public meetings, and constitutional methods to seek greater Indian participation in governance. A compare/contrast answer should organise differences by method, aims, or period and support each point with examples from the prescribed text.','answer-guide'],
  ['history','The Union Parliament','Civics','India’s Parliament consists of the President and two Houses: the Lok Sabha and the Rajya Sabha. The Lok Sabha is directly elected; the Rajya Sabha represents the states and is a continuing chamber. For a civics response, distinguish composition, term, and functions, and follow the exact wording of the question.','concept'],
  ['history','The Supreme Court of India','Civics','The Supreme Court is India’s highest judicial body. Its jurisdiction includes original, appellate, and advisory jurisdiction, subject to constitutional provisions. Judicial review is the power to examine whether laws or executive actions comply with the Constitution. Use the textbook’s specific examples when explaining these functions.','concept'],

  ['english-language','Formal letter writing','Composition','A clear formal letter uses the expected address/date and recipient details, a focused subject line when appropriate, a suitable salutation, short organised paragraphs, a courteous close, and a signature. Address every part of the prompt, use a consistent formal register, and leave time to check grammar, punctuation, and the word limit.','writing'],
  ['english-language','Notice and email writing','Composition','A notice should make the event, audience, date/time, venue, and action unmistakable, using a concise heading and only relevant details. An email needs a meaningful subject, suitable greeting, organised message, and appropriate sign-off. Follow the exam prompt’s required format and word limit.','writing'],
  ['english-language','Comprehension and summary','Reading','Read the passage once for its central idea, then locate evidence for each question. Answer in your own words where requested and keep within the stated limit. A summary should include only the main points, avoid examples and repetition, preserve the author’s meaning, and follow the prompt’s length and format.','strategy'],

  ['english-literature','Reading a poem closely','Poetry','For a poem response, connect a quotation or precise textual detail to the speaker, situation, imagery, tone, and theme. Explain how a poetic choice creates meaning rather than only naming a device. Interpret the prescribed poem itself; an online-style general theme cannot replace evidence from your set text.','answer-guide'],
  ['english-literature','Literary devices: image and metaphor','Poetry and prose','A simile makes a comparison using words such as “like” or “as”; a metaphor describes one thing as another; personification gives human qualities to non-human things. Identify the exact words, name the device only when justified, and explain its effect in context.','concept'],
  ['english-literature','Building a text-based answer','Prose and drama','Start with a direct answer to the question. Add a relevant incident, character choice, or short textual reference, then explain what it reveals. Avoid retelling the whole plot. Check the prescribed edition for exact character names, quotations, and chapter/scene details.','answer-guide'],

  ['geography','Reading a topographical map','Map work','Use the map legend and scale first. Grid references are read eastings before northings; a four-figure reference identifies a grid square and a six-figure reference pinpoints a location within it. Contour lines join points of equal height; close spacing shows a steep slope and wide spacing a gentle slope.','map-skill'],
  ['geography','Monsoon climate of India','Climate','India’s seasonal rainfall is strongly influenced by the monsoon circulation. The south-west monsoon brings much of the annual rain to many regions, but amount and timing vary with relief, distance from the sea, and regional winds. When comparing areas, support the contrast with location and the relevant rain-bearing mechanism.','concept'],
  ['geography','Soil conservation','Resources','Soil erosion removes fertile topsoil through agents such as water and wind. Conservation measures include contour ploughing, terracing on slopes, shelter belts, afforestation, and maintaining vegetation cover. Match the measure to the local cause of erosion, and distinguish prevention from restoration.','concept'],
  ['geography','Renewable and non-renewable resources','Resources','Renewable resources are replenished on a human timescale when managed sustainably; non-renewable resources form much more slowly than they are consumed. Solar and wind power are renewable examples; coal and petroleum are fossil fuels and non-renewable. Explain both availability and environmental impact when comparing energy choices.','concept'],
];

export const STARTER_DOCS = starter.map(([subject, title, chapter, text, kind], index) => ({
  id: `starter-${index + 1}`,
  subject,
  title,
  chapter,
  text,
  kind,
  type: 'reference',
  source: 'Study Desk quick revision pack',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  pageTexts: [],
  images: [],
  immutable: true,
}));

export const subjectById = (id) => SUBJECTS.find((subject) => subject.id === id);
