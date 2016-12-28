var SitePath = require ('sitepath');
var textblocks = require('textblocks');
var Protoset = require('../../lib/protoset');
var ActivityFeed = require('../../lib/activityfeed');
var IndexFeed = require('../../lib/indexfeed');
var TagHelpers = require('../../lib/taghelpers');
var SiteHelpers = require('../../lib/sitehelpers');
var SchemeHelpers = require('../../lib/schemehelpers');
var ReactHelpers = require('../../lib/reacthelpers');
var imageScale = require('../../lib/imagescale');

exports = module.exports = function(dust, db, cache, query, reactDir) {

  ActivityFeed.installDust(dust, db, query);
  IndexFeed.installDust(dust, db, cache, query);
  TagHelpers.installDust(dust, db, query);
  SiteHelpers.installDust(dust, db, query);
  SchemeHelpers.installDust(dust, db, query);
  ReactHelpers.installDust(dust, db, query, reactDir);

  dust.helpers.thumbnail = function(chunk, context, bodies, params) {
    var size = context.resolve(params.size);
    var svgicon = context.get('meta.rm3\:svg');
    var imgicon = context.get('meta.rm3\:srcset');
    var sizes = context.get('meta.rm3\:sizes');
    var scaleSize = imageScale.scaleBestFit(sizes.width, sizes.height, size);
    if (svgicon) {
      return chunk.write('<picture><source srcset="' + svgicon +
                '" type="image/svg+xml"><img srcset="' + imgicon +
                '"  height="' + scaleSize.height + '" width="' +
                scaleSize.width + '" border="0" data-width="' +
                scaleSize.width + '" data-height="' + scaleSize.height + '"/></picture>');
    } else {
      return chunk.write('<img srcset="' + imgicon + '"  height="' + scaleSize.height +
                '" width="' + scaleSize.width + '" border="0" data-width="' +
                scaleSize.width + '" data-height="' + scaleSize.height + '"/>');
    }
  };

  dust.helpers.textblock = function(chunk, context, bodies, params) {
    var textblock = context.resolve(params.field);
    var resolve = context.resolve(params.resolve);
    var ctx = context.get('ctx');
    var sitepath = context.get('path');
    var scheme = context.get('scheme');
    var site = context.get('site');
    var protoset = context.get('protoset');
    var security = context.get('security');
    var blobstores = context.get('blobstores');
    var state_ctx = {
      ctx: ctx,
      db: db,
      sitepath: sitepath,
      scheme: scheme,
      site: site,
      protoset: protoset,
      access: security,
      blobstores: blobstores
    };
    if (textblock) {
      return chunk.map(function(chunk) {
        textblocks.outputTextBlock(textblock, resolve, state_ctx ,function(err, output) {
          chunk.write(output);
          return chunk.end();
        });
      });
    } else {
      return chunk.end();
    }
  };



  dust.helpers.requirePermission = function(chunk, context, bodies, params) {
    var path = context.resolve(params.path);
    var permission = context.resolve(params.permission);
    if (permission === 'edit' || permission === 'delete') {
      permission = 'post.' + permission;
    }

    var user = context.get('user');
    var permissions = context.get('permissions');

    if (permission && permissions.hasOwnProperty(permission)) {
      return chunk.render(bodies.block, context);
    } else {
      if (bodies.else) {
        return chunk.render(bodies.else, context);
      }
    }
  };

  dust.helpers.requirePermissionOr = function(chunk, context, bodies, params) {
    var path = context.resolve(params.path);
    var permission = context.resolve(params.permission);
    if (permission === 'edit' || permission === 'delete') {
      permission = 'post.' + permission;
    }

    var permissionOr = context.resolve(params.permissionOr);
    if (permissionOr === 'edit' || permissionOr === 'delete') {
      permissionOr = 'post.' + permissionOr;
    }

    var user = context.get('user');
    var permissions = context.get('permissions');

    if (permission && (permissions.hasOwnProperty(permission) || permissions.hasOwnProperty(permissionOr))) {
      return chunk.render(bodies.block, context);
    } else {
      if (bodies.else) {
        return chunk.render(bodies.else, context);
      }
    }
  };

  dust.helpers.requireUser = function(chunk, context, bodies, params) {
    var user = context.get('user');
    if (user) {
      return chunk.render(bodies.block, context);
    } else {
      if (bodies.else) {
        return chunk.render(bodies.else, context);
      }
    }
  };

  dust.helpers.availableRoles = function(chunk, context, bodies, params) {
    var ctx = context.get('ctx');
    return chunk.map(function(chunk) {
      var resp = query.listRoles(db, ctx);
      var idx = 0;
      resp.on('article', function(article) {
        chunk.render(bodies.block, context.push(
          {role: article.role,
            '$idx': idx}));
        idx = idx + 1;
      });
      resp.on('error', function(err) {
        chunk.end();
      });
      resp.on('end', function() {
        chunk.end();
      });
    });
  };

  dust.helpers.userRoles = function(chunk, context, bodies, params) {
    var ctx = context.get('ctx');
    var userPath = context.get('path');
    return chunk.map(function(chunk) {
      var resp = query.permissionsForUser(db, ctx, userPath);
      var roles = {};
      resp.on('article', function(article) {
        if (!roles.hasOwnProperty(article.role)) {
          roles[article.role] = [];
        }
        roles[article.role].push({permission: article.permission,
          path: article.path});
      });
      resp.on('error', function(err) {
        chunk.end();
      });
      resp.on('end', function() {
        var idx = 0;
        for (var key in roles) {
          if (roles.hasOwnProperty(key)) {
            var article = roles[key];
            chunk.render(bodies.block, context.push(
              {role: key,
                data: article,
                '$idx': idx}));
            idx = idx + 1;
          }
        }
        chunk.end();
      });
    });
  };

  dust.helpers.isThisUser = function(chunk, context, bodies, params) {
    var user = context.get('userPath');
    var path = context.get('path');
    if (user) {
      if (user.toDottedPath() == path.toDottedPath()) {
        return chunk.render(bodies.block, context);
      } else {
        return chunk.render(bodies.else, context);
      }
    }
  };

};
