describe('Adicionar tarefa', () => {
  it('deve inserir tarefa e exibir na lista', () => {
    cy.visit('/');
    cy.get('#open-modal').click();
    cy.get('#task-day').select('segunda');
    cy.get('#task-time').type('10:00');
    cy.get('#task-desc').type('Reunião');
    cy.contains('button', 'Salvar').click();
    cy.contains('.task-item .time', '10:00');
    cy.contains('.task-item .desc', 'Reunião');
  });
});
