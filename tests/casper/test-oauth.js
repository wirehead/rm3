/* global casper */
/*jshint expr:true */

describe('User', function() {
  beforeEach(function() {
    casper.start('http://127.0.0.1:9000/');
  });

  after(function() {
    casper.thenOpen('http://127.0.0.1:4000/$logout/');
  });
  it('should be able to log in and out', function() {
    casper.then(function() {
      'a[href*=auth]'.should.be.inDOM.and.be.visible;
      this.click('a[href*=auth]');
    });
    casper.then(function() {
      'a[href*=login]'.should.be.inDOM.and.be.visible;
      'div.footer'.should.be.inDOM.and.be.visible;
      this.click('a[href*=login]');
    });
    casper.then(function() {
      'form[action*=login]'.should.be.inDOM.and.be.visible;
      'div.footer'.should.be.inDOM.and.be.visible;
      this.fill('form[action*=login]',
        {username: 'wirehead',
          password: 'password'}, true);
    });
    casper.then(function() {
      this.click('#allow');
    });
    casper.then(function() {
      'pre'.should.contain.text('access_token');
      'pre'.should.contain.text('Bearer');
    });
  });
});
