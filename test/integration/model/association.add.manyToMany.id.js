var Waterline = require('../../../lib/waterline'),
    assert = require('assert');

describe('Model', function() {
  describe('associations Many To Many', function() {
    describe('.add() with an id', function() {

      /////////////////////////////////////////////////////
      // TEST SETUP
      ////////////////////////////////////////////////////

      var collections = {};
      var prefValues = [];

      before(function(done) {
        var waterline = new Waterline();

        var User = Waterline.Collection.extend({
          adapter: 'foo',
          tableName: 'person',
          attributes: {
            preferences: {
              collection: 'preference'
            }
          }
        });

        var Preference = Waterline.Collection.extend({
          adapter: 'foo',
          tableName: 'preference',
          attributes: {
            foo: 'string',
            people: {
              collection: 'person'
            }
          }
        });

        waterline.loadCollection(User);
        waterline.loadCollection(Preference);

        var _values = [
          { id: 1, preference: [{ foo: 'bar' }, { foo: 'foobar' }] },
          { id: 2, preference: [{ foo: 'a' }, { foo: 'b' }] },
        ];

        var i = 1;

        var adapterDef = {
          find: function(col, criteria, cb) {
            if(col === 'person_preference') return cb(null, []);
            cb(null, _values);
          },
          update: function(col, criteria, values, cb) {
            if(col === 'preference') {
              prefValues.push(values);
            }

            return cb(null, values);
          },
          create: function(col, values, cb) {
            prefValues.push(values);
            return cb(null, values);
          },
        };

        waterline.initialize({ adapters: { foo: adapterDef }}, function(err, colls) {
          if(err) done(err);
          collections = colls;
          done();
        });
      });


      /////////////////////////////////////////////////////
      // TEST METHODS
      ////////////////////////////////////////////////////

      it('should pass foreign key values to update method for each relationship', function(done) {
        collections.person.find().exec(function(err, models) {
          if(err) return done(err);

          var person = models[0];

          person.preferences.add(1);
          person.preferences.add(2);

          person.save(function(err) {
            if(err) return done(err);

            assert(prefValues.length === 2);
            assert(prefValues[0].person === 1);
            assert(prefValues[1].person === 1);

            done();
          });
        });
      });

    });
  });
});
