import type { Day } from './types'

/**
 * Catálogo dos 21 dias do livro "20 dias para curar a sua vida"
 * de Lise Bourbeau. Títulos extraídos do sumário real do PDF.
 *
 * 3 semanas:
 *  - Semana 1 (Fundação):  dias 1-7
 *  - Semana 2 (Cura interna): dias 8-14
 *  - Semana 3 (Vida plena):  dias 15-21
 */
export const DAYS: Day[] = [
  // SEMANA 1 — FUNDAÇÃO
  { number: 1,  week: 1, title: 'Amando a si mesmo', hint: 'O primeiro passo da jornada é reconhecer que você merece se amar.', mirror: 'Olhe para si e diga: "Eu me aceito profundamente".' },
  { number: 2,  week: 1, title: 'Fazendo do espelho seu amigo', hint: 'Transforme o espelho em aliado da sua jornada interior.', mirror: 'Sorria para si mesmo(a) por 30 segundos, sem julgamentos.' },
  { number: 3,  week: 1, title: 'Monitorando seu diálogo interior', hint: 'Preste atenção à voz que fala com você o dia todo.', mirror: 'Repita em voz alta: "Eu escolho pensamentos de amor".' },
  { number: 4,  week: 1, title: 'Deixando o passado para trás', hint: 'O que foi, foi. O agora é seu.', mirror: 'Olhe nos seus olhos e diga: "Eu me perdoo por tudo".' },
  { number: 5,  week: 1, title: 'Construindo sua autoestima', hint: 'Sua autoestima é construída por você, para você.', mirror: 'Liste em voz alta 5 coisas que admira em si.' },
  { number: 6,  week: 1, title: 'Libertando seu crítico interior', hint: 'A voz que critica não é você. Você é maior que ela.', mirror: 'Diga: "Eu silencie o crítico e escuto meu coração".' },
  { number: 7,  week: 1, title: 'Amando a si mesmo: revisão da 1ª semana', hint: 'Integre o que aprendeu. Observe o que mudou.', mirror: 'Olhe para si e diga: "Eu mereço amor — começando pelo meu".' },

  // SEMANA 2 — CURA INTERNA
  { number: 8,  week: 2, title: 'Amando sua criança interior — 1ª parte', hint: 'A criança em você ainda precisa de colo.', mirror: 'Coloque a mão no coração e diga: "Eu cuido de você".' },
  { number: 9,  week: 2, title: 'Amando sua criança interior — 2ª parte', hint: 'Continue acolhendo. A cura é um processo.', mirror: 'Permita-se chorar se sentir. Sem julgamento.' },
  { number: 10, week: 2, title: 'Amando seu corpo, curando sua dor', hint: 'Seu corpo é seu aliado. Ele merece gratidão.', mirror: 'Agradeça a cada parte do corpo que conseguir.' },
  { number: 11, week: 2, title: 'Sentindo-se bem, libertando-se da raiva', hint: 'A raiva presa adoece. Liberte-se com consciência.', mirror: 'Respire fundo três vezes dizendo: "Eu solto com amor".' },
  { number: 12, week: 2, title: 'Superando o medo', hint: 'O medo diminui quando você se olha com coragem.', mirror: 'Enfrente seus olhos e diga: "Eu sou mais forte que meu medo".' },
  { number: 13, week: 2, title: 'Começando o dia com amor', hint: 'A primeira hora define o tom. Comece com amor.', mirror: 'Acorde, olhe no espelho e diga: "Hoje eu me amo primeiro".' },
  { number: 14, week: 2, title: 'Amando a si mesmo: revisão da 2ª semana', hint: 'Reconecte com seu progresso. Você está mudando.', mirror: 'Sorria. Você já é diferente de quem começou.' },

  // SEMANA 3 — VIDA PLENA
  { number: 15, week: 3, title: 'Perdoando a si mesmo e àqueles que o magoaram', hint: 'Perdão liberta. Quem perdoa, se liberta.', mirror: 'Diga: "Eu me perdoo e perdoo todos que me feriram".' },
  { number: 16, week: 3, title: 'Curando seus relacionamentos', hint: 'Curando-se, você cura quem está à sua volta.', mirror: 'Olhe para si e diga: "Eu me relaciono com amor".' },
  { number: 17, week: 3, title: 'Vivendo sem estresse', hint: 'Estresse é sinal de desalinhamento. Volte para si.', mirror: 'Relaxe o rosto. Solte os ombros. Respire.' },
  { number: 18, week: 3, title: 'Recebendo sua prosperidade', hint: 'Você merece abundância. Abra-se para receber.', mirror: 'Diga: "Eu mereço prosperidade em todas as formas".' },
  { number: 19, week: 3, title: 'Vivendo a atitude de gratidão', hint: 'Gratidão transforma o que você tem em suficiente.', mirror: 'Agradeça em voz alta por 5 coisas do seu dia.' },
  { number: 20, week: 3, title: 'Ensinando o trabalho com o espelho para crianças', hint: 'Multiplique o amor. Ensine crianças a se amarem.', mirror: 'Sorria como uma criança faria.' },
  { number: 21, week: 3, title: 'Amando a si mesmo, agora', hint: 'O começo e o fim se encontram: você se ama, agora e sempre.', mirror: 'Diga com convicção: "Eu me amo. Eu me aceito. Eu sou suficiente".' },
]

export const BOOK_TITLE = '20 dias para curar a sua vida'
export const BOOK_SUBTITLE = 'Aprenda a se amar trabalhando com o espelho'
export const BOOK_AUTHOR = 'Lise Bourbeau'

export const WEEKS = [
  { number: 1, title: 'Fundação', subtitle: 'A base do amor-próprio' },
  { number: 2, title: 'Cura interna', subtitle: 'Curando a criança e o corpo' },
  { number: 3, title: 'Vida plena', subtitle: 'Perdão, gratidão e integração' },
] as const
