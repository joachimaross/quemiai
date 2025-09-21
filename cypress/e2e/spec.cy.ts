describe('API Root Test', () => {
  it('should display welcome message at API root', () => {
    cy.visit('/.netlify/functions/api');
    cy.contains('Welcome to the Joachima Social App API!');
  });
});
