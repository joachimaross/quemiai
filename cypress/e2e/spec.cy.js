describe('API Root Test', function () {
    it('should display welcome message at API root', function () {
        cy.visit('/.netlify/functions/api');
        cy.contains('Welcome to the Joachima Social App API!');
    });
});
