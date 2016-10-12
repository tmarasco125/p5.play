describe('CircleCollider', function() {
  var pInst;

  beforeEach(function() {
    pInst = new p5(function() {});
  });

  afterEach(function() {
    pInst.remove();
  });

  // Create with zero offset and radius=1 to simplify tests
  function makeAt(x, y) {
    return new pInst.CircleCollider(
      new p5.Vector(x, y),
      1,
      new p5.Vector(0, 0)
    );
  }

  it('conforms to the collider interface', function() {
    // Still figuring out what this is though;
    var collider = new pInst.CircleCollider();
    expect(collider).to.haveOwnProperty('draw');
    expect(collider).to.haveOwnProperty('overlap');
    expect(collider).to.haveOwnProperty('collide');
    expect(collider).to.haveOwnProperty('size');
    expect(collider).to.haveOwnProperty('left');
    expect(collider).to.haveOwnProperty('right');
    expect(collider).to.haveOwnProperty('top');
    expect(collider).to.haveOwnProperty('bottom');
  });

  describe('overlap()', function() {
    describe('circle-circle', function() {
      // Returns a boolean.
      it('true when exactly overlapped', function() {
        var a = makeAt(2, 2);
        var b = makeAt(2, 2);
        expect(a.overlap(b)).to.be.true;
        expect(b.overlap(a)).to.be.true;
      });

      it('true when partially overlapped', function() {
        var a = makeAt(2, 2);
        var b = makeAt(2, 3);
        expect(a.overlap(b)).to.be.true;
        expect(b.overlap(a)).to.be.true;
      });

      it('false when tangent along axes', function() {
        var a = makeAt(2, 2);
        var b = makeAt(4, 2); // Separated by 2 on the x-axis
        expect(a.overlap(b)).to.be.false;
        expect(b.overlap(a)).to.be.false;

        var c = makeAt(2, 4); // Separated by 2 on the y-axis
        expect(a.overlap(c)).to.be.false;
        expect(c.overlap(a)).to.be.false;
      });

      it('true when tangent along 45deg line', function() {
        var a = makeAt(2, 2);
        var b = makeAt(2 + 2*Math.cos(Math.PI / 4),
                       2 + 2*Math.sin(Math.PI / 4));
        expect(a.overlap(b)).to.be.true;
        expect(b.overlap(a)).to.be.true;
      });

      it('false when distant along axes', function() {
        var a = makeAt(2, 2);
        var b = makeAt(5, 2); // Separated by 3 on the x-axis
        expect(a.overlap(b)).to.be.false;
        expect(b.overlap(a)).to.be.false;

        var c = makeAt(2, 5); // Separated by 3 on the y-axis
        expect(a.overlap(c)).to.be.false;
        expect(c.overlap(a)).to.be.false;
      });

      it('false when distant along 45deg line', function() {
        var a = makeAt(2, 2);
        var b = makeAt(4, 4); // Separated by 2 on both x and y axes
        expect(a.overlap(b)).to.be.false;
        expect(b.overlap(a)).to.be.false;
      });
    });
  });

  describe('collide()', function() {
    // Returns an displacement vector
    describe('circle-circle', function() {
      it('projects horizontally when exactly overlapped', function() {
        var a = makeAt(2, 2);
        var b = makeAt(2, 2);
        var displacementA = a.collide(b);
        var displacementB = b.collide(a);
        expect(displacementA.x).to.equal(2);
        expect(displacementA.y).to.equal(0);
        expect(displacementB.x).to.equal(2);
        expect(displacementB.y).to.equal(0);
      });

      it('projects out when partially overlapped along axes', function() {
        var a = makeAt(2, 2);
        var b = makeAt(2, 3);
        var verticalDisplacementA = a.collide(b);
        var verticalDisplacementB = b.collide(a);
        expect(verticalDisplacementA.x).to.closeTo(0, 0.001);
        expect(verticalDisplacementA.y).to.equal(-1);
        expect(verticalDisplacementB.x).to.closeTo(0, 0.001);
        expect(verticalDisplacementB.y).to.equal(1);

        var c = makeAt(3, 2);
        var horizontalDisplacementA = a.collide(c);
        var horizontalDisplacementB = c.collide(a);
        expect(horizontalDisplacementA.x).to.equal(-1);
        expect(horizontalDisplacementA.y).to.closeTo(0, 0.001);
        expect(horizontalDisplacementB.x).to.equal(1);
        expect(horizontalDisplacementB.y).to.closeTo(0, 0.001);
      });

      it('projects at an angle when overlapped at an angle', function () {
        var a = makeAt(2, 2);

        // At 45deg
        var b = makeAt(3, 3);
        var displacementA = a.collide(b);
        var displacementB = b.collide(a);
        expect(displacementA.x).to.be.closeTo(-0.414, 0.001);
        expect(displacementA.y).to.be.closeTo(-0.414, 0.001);
        expect(displacementB.x).to.be.closeTo(0.414, 0.001);
        expect(displacementB.y).to.be.closeTo(0.414, 0.001);

        var c = makeAt(1.5, 3);
        var displacementC = a.collide(c);
        var displacementD = c.collide(a);
        expect(displacementC.x).to.be.closeTo(0.394, 0.001);
        expect(displacementC.y).to.be.closeTo(-0.788, 0.001);
        expect(displacementD.x).to.be.closeTo(-0.394, 0.001);
        expect(displacementD.y).to.be.closeTo(0.788, 0.001);
      });

      it('returns zero vector when not overlapping', function() {
        var a = makeAt(2, 2);

        var b = makeAt(5, 2); // Separated by 3 on the x-axis
        var displacementB1 = a.collide(b);
        var displacementB2 = b.collide(a);
        expect(displacementB1.x).to.equal(0);
        expect(displacementB1.y).to.equal(0);
        expect(displacementB2.x).to.equal(0);
        expect(displacementB2.y).to.equal(0);

        var c = makeAt(2, 5); // Separated by 3 on the y-axis
        var displacementC1 = a.collide(c);
        var displacementC2 = c.collide(a);
        expect(displacementC1.x).to.equal(0);
        expect(displacementC1.y).to.equal(0);
        expect(displacementC2.x).to.equal(0);
        expect(displacementC2.y).to.equal(0);

        var d = makeAt(4, 4); // Separated by 2 on both x and y axes
        var displacementD1 = a.collide(d);
        var displacementD2 = d.collide(a);
        expect(displacementD1.x).to.equal(0);
        expect(displacementD1.y).to.equal(0);
        expect(displacementD2.x).to.equal(0);
        expect(displacementD2.y).to.equal(0);
      });
    });
  });

  describe('size()', function() {
    var collider, radius;

    beforeEach(function (){
      radius = Math.floor(100 * Math.random());
      collider = new pInst.CircleCollider(
        new p5.Vector(0, 0),
        radius,
        new p5.Vector(0, 0)
      );
    });

    it('returns a p5.Vector', function() {
       expect(collider.size()).to.be.an.instanceOf(p5.Vector);
    });

    it('is twice the circle radius in each direction', function () {
      var size = collider.size();
      expect(size.x).to.equal(2*radius);
      expect(size.y).to.equal(2*radius);
    })
  });
});
