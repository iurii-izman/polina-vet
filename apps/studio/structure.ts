import type { StructureResolver } from 'sanity/structure';

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('POLINA VET')
    .items([
      S.listItem()
        .title('МАТЕРИАЛЫ')
        .child(
          S.list()
            .title('МАТЕРИАЛЫ')
            .items([
              S.documentTypeListItem('article').title('Материалы'),
              S.documentTypeListItem('page').title('Страницы'),
              S.documentTypeListItem('clinicalCase').title('Клинические случаи'),
            ]),
        ),
      S.listItem()
        .title('ТРЕБУЕТ ВНИМАНИЯ')
        .child(
          S.list()
            .title('ТРЕБУЕТ ВНИМАНИЯ')
            .items([
              S.listItem()
                .title('Материалы высокого риска')
                .child(
                  S.documentList()
                    .title('Материалы высокого риска')
                    .filter('_type == "article" && riskLevel == "HIGH"'),
                ),
              S.listItem()
                .title('Снятые материалы')
                .child(
                  S.documentList()
                    .title('Снятые материалы')
                    .filter('_type == "article" && withdrawn == true'),
                ),
              S.listItem()
                .title('Проблемные источники')
                .child(
                  S.documentList()
                    .title('Проблемные источники')
                    .filter(
                      '_type == "article" && count(sources[@->status in ["withdrawn", "superseded"]]) > 0',
                    ),
                ),
              S.listItem()
                .title('Переводы на проверку')
                .child(
                  S.documentList()
                    .title('Переводы на проверку')
                    .filter(
                      '_type == "article" && defined(translatedFrom) && (!defined(sourceMedicalRevision) || sourceMedicalRevision != translatedFrom->medicalRevision)',
                    ),
                ),
            ]),
        ),
      S.listItem()
        .title('СПРАВОЧНИК')
        .child(
          S.list()
            .title('СПРАВОЧНИК')
            .items([
              S.documentTypeListItem('species').title('Виды животных'),
              S.documentTypeListItem('topic').title('Темы'),
              S.documentTypeListItem('source').title('Источники'),
              S.documentTypeListItem('author').title('Авторы'),
            ]),
        ),
      S.listItem()
        .title('САЙТ')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Настройки сайта'),
        ),
    ]);
