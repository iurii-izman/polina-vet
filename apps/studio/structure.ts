import type { StructureResolver } from 'sanity/structure';

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('POLINA VET')
    .items([
      S.listItem().title('Материалы').child(S.documentTypeList('article').title('Материалы')),
      S.listItem().title('Страницы').child(S.documentTypeList('page').title('Страницы')),
      S.listItem()
        .title('Клинические случаи')
        .child(S.documentTypeList('clinicalCase').title('Клинические случаи')),
      S.divider(),
      S.documentTypeListItem('author').title('Авторы'),
      S.documentTypeListItem('species').title('Виды животных'),
      S.documentTypeListItem('topic').title('Темы'),
      S.documentTypeListItem('source').title('Источники'),
      S.documentTypeListItem('siteSettings').title('Настройки сайта'),
    ]);
