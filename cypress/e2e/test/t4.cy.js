describe('test4', () => {
  it('test4 parallel', { tags: ['testSmoke'] }, () => {
    cy.wait(1000);
    expect(true).to.be.equal(false);
  });
});
