INSERT INTO usuario (nome, login, senha_hash) VALUES
('Admin', 'admin', '$2b$10$QuthkRgh2vnHFjvt6c.h5uw2rGW8GRl6GjkRSrLDaTpal/uPEKO6i');

INSERT INTO oferta (id, codigo, curso, grau_academico, modalidade) VALUES
(1, 'O04', 'Ciência da Computação',                               'Bacharelado', 'Educação Presencial'),
(2, 'O12', 'Engenharia de Computação',                            'Bacharelado', 'Educação Presencial'),
(3, 'O30', 'Tecnologia em Análise e Desenvolvimento de Sistemas', 'Tecnológico', 'Educação a Distância');

INSERT INTO resultado (oferta_id, edicao, inscritos, participantes, nota_fg, nota_ce, conceito_continuo, conceito_faixa,
                       ponto_forte, ponto_atencao, origem_dado, fonte_url) VALUES

(1, 2017, 28, 19, 60.8421, 37.9895, 2.7181, '3',
 'Formação Geral de 60,84, a maior nota bruta de FG do recorte, e o maior conceito contínuo do recorte (2,72).',
 'Participação de 67,86% (19 de 28 inscritos), a mais baixa do recorte.',
 'OFICIAL_INEP', 'https://download.inep.gov.br/educacao_superior/indicadores/legislacao/2018/resultados_conceito_enade_2017.csv'),
(1, 2021, 20, 18, 33.516, 34.861, 2.054, '3',
 'Participação subiu para 90,00% (18 de 20) e o Componente Específico (34,86) ficou acima da Formação Geral (33,52).',
 'Conceito contínuo caiu de 2,72 em 2017 para 2,05, e a Formação Geral recuou 27,33 pontos.',
 'OFICIAL_INEP', 'https://download.inep.gov.br/educacao_superior/indicadores/resultados/2021/conceito_enade_2021.xlsx'),

(2, 2017, 9, 8, 49.525, 31.9, 1.3169, '2',
 'Participação de 88,89% (8 de 9 inscritos).',
 'Menor conceito contínuo do recorte (1,32), com Componente Específico de 31,90.',
 'OFICIAL_INEP', 'https://download.inep.gov.br/educacao_superior/indicadores/legislacao/2018/resultados_conceito_enade_2017.csv'),
(2, 2019, 9, 9, 50.6222, 34.2667, 2.2146, '3',
 'Único conceito 3 da oferta na série, com 100% de participação (9 de 9).',
 'Turma pequena: cada participante pesa cerca de 11% do resultado; o CE (34,27) segue abaixo da FG (50,62).',
 'OFICIAL_INEP', 'https://download.inep.gov.br/educacao_superior/indicadores/resultados/2019/Conceito_Enade_2019.xlsx'),
(2, 2023, 6, 6, 52.716667, 26.9, 1.407574, '2',
 'Participação de 100% (6 de 6) e Formação Geral de 52,72.',
 'Conceito voltou a 2 (contínuo 1,41); o CE de 26,90 é o mais baixo do recorte, 25,82 pontos abaixo da FG.',
 'OFICIAL_INEP', 'https://download.inep.gov.br/educacao_superior/indicadores/resultados/2023/conceito_enade_2023.xlsx'),

(3, 2021, 45, 39, 33.01, 30.528, 2.491, '3',
 'Maior conceito contínuo de 2021 no recorte (2,49) e maior turma avaliada (39 participantes).',
 'Só há uma edição publicada para esta oferta EaD, então a série histórica é limitada; o CE (30,53) ficou abaixo da FG (33,01).',
 'OFICIAL_INEP', 'https://download.inep.gov.br/educacao_superior/indicadores/resultados/2021/conceito_enade_2021.xlsx');

INSERT INTO acao (oferta_id, titulo, descricao, situacao, responsavel, prazo, nome_original_anexo, caminho_anexo) VALUES
(2, 'Revisão dos conteúdos do componente específico',
 'Mapear com o NDE os conteúdos do Componente Específico com menor desempenho e planejar oficinas de revisão para a próxima turma inscrita.',
 'Em andamento', 'NDE de Engenharia de Computação', '2027-03-15',
 'plano_revisao_ce.pdf', '639000000000000000_demo0000000000000000000000000001.pdf'),
(1, 'Campanha de comparecimento ao ENADE',
 'Reforçar com os concluintes a importância de comparecer à prova, com avisos em sala e no ambiente virtual.',
 'Em planejamento', 'Coordenação de Ciência da Computação', '2027-05-30', NULL, NULL),
(3, 'Simulado online de Formação Geral',
 'Aplicar no ambiente virtual um simulado com questões de Formação Geral para os estudantes do curso EaD.',
 'Concluída', 'Tutoria EaD', '2026-11-20', NULL, NULL);
