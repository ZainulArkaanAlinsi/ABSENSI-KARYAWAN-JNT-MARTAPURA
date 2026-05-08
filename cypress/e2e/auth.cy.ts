describe('JNE Admin Auth & Data Integrity E2E', () => {
  const loginUrl = '/login';
  const adminEmail = 'admin@jne.com';
  const adminPassword = 'securepassword123';

  beforeEach(() => {
    cy.visit(loginUrl);
  });

  it('should display all UI elements correctly', () => {
    cy.get('h1').should('contain', 'Admin Portal');
    cy.get('input[placeholder="ID PENGGUNA"]').should('be.visible');
    cy.get('input[placeholder="KODE KEAMANAN"]').should('be.visible');
    cy.get('button').contains('Verifikasi Akses').should('be.visible');
    
    // Sensitive Data Check: Ensure password is masked
    cy.get('input[placeholder="KODE KEAMANAN"]').should('have.attr', 'type', 'password');
  });

  it('should handle login flow successfully', () => {
    // Mocking Firebase Auth might be needed in a real CI, 
    // but for E2E we test the real flow
    cy.get('input[placeholder="ID PENGGUNA"]').type(adminEmail);
    cy.get('input[placeholder="KODE KEAMANAN"]').type(adminPassword);
    cy.get('button').contains('Verifikasi Akses').click();

    // Check loading state
    cy.get('svg.animate-spin').should('be.visible');

    // Should redirect to dashboard on success
    cy.url().should('include', '/dashboard');
  });

  it('should handle error when server is unresponsive or invalid credentials', () => {
    // Intercept Firebase Auth call to simulate failure if needed
    // For now, testing invalid credentials
    cy.get('input[placeholder="ID PENGGUNA"]').type('wrong@user.com');
    cy.get('input[placeholder="KODE KEAMANAN"]').type('wrongpassword');
    cy.get('button').contains('Verifikasi Akses').click();

    // Error message check
    cy.get('.text-red-500').should('be.visible').and('not.be.empty');
  });

  it('should ensure no sensitive data is exposed in the frontend', () => {
    cy.visit('/dashboard');
    // Check if any Firebase config or secrets are accidentally rendered in plain text
    cy.get('body').should('not.contain', 'apiKey');
    cy.get('body').should('not.contain', 'authDomain');
  });
});
