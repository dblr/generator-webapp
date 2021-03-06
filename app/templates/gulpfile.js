// generated on <%= date %> using <%= name %> <%= version %>
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

let dev = true;

//Gather Required Goodies
const gp_concat = require('gulp-concat-util'),
  gp_rename = require('gulp-rename'),
  htmlreplace = require('gulp-html-replace'),
  replace = require('gulp-replace-task'),
  deleteLines = require('gulp-delete-lines'),
  liquify = require('gulp-liquify'),
  swig = require('gulp-swig'),
  gravatar = require('gravatar'),
  removeEmptyLines = require('gulp-remove-empty-lines'),
  fs = require('fs');

//Desk/Liquid
var customFilters = {
  gravatar_image: function (url) {
    var unsecureUrl = gravatar.url(url, {
      s: '100',
      r: 'x',
      d: 'retro'
    }, false);
    var url = gravatar.url(url);
    return '<img src="' + url + '"/>';
  },
  in_time_zone: function (str) {
    return str;
  },
  clip: function (str) {
    var strnew = str.substring(0, 200)
    return strnew;
  },
  format_snippet: function (str) {
    return str;
  },
  portal_image_url: function (str) {
    return str;
  },
  form: function (str) {
    return str;
  },
  customer_feedback: function (str) {
    return str;
  },
  show_something: function (str) {
    return str;
  },
  escape_newlines: function (str) {
    return str;
  },
  pluralize: function (str) {
    return str;
  }
}
var locals = JSON.parse(fs.readFileSync('./app/data.json', 'utf8'));
gulp.task('templates', function () {
  gulp.src(['app/pages/*.html'])
    .pipe(liquify(locals, {
      filters: customFilters
    }))
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({
      stream: true
    }));
});
gulp.task('widgets', function () {
  gulp.src(['app/widgets/*.html'])
    .pipe(liquify(locals, {
      filters: customFilters
    }))
    .pipe(gulp.dest('.tmp/widgets/'))
    .pipe(reload({
      stream: true
    }));
});
gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
    }))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({
      stream: true
    }));
});

function lint(files) {
  return gulp.src(files)
    .pipe($.eslint({
      fix: true
    }))
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js')
    .pipe(gulp.dest('app/scripts'));
});
gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js')
    .pipe(gulp.dest('test/spec'));
});

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({
      searchPath: ['.tmp', 'app', '.']
    }))
    .pipe($.if(/\.js$/, $.uglify({
      compress: {
        drop_console: true
      }
    })))
    .pipe($.if(/\.css$/, $.cssnano({
      safe: true,
      autoprefixer: false
    })))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {
        compress: {
          drop_console: true
        }
      },
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
      .concat('app/fonts/**/*'))
    .pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*',
    '!app/*.html',
    '!app/data.json'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
  runSequence(['clean', 'wiredep'], ['templates', 'widgets', ' styles', 'scripts', 'fonts'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['.tmp', 'app'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });
    gulp.watch([
      'app/images/**/*',
      '.tmp/fonts/**/*'
    ]).on('change', reload);
    gulp.watch(['app/pages/*.html', 'app/widgets/*.html', 'app/*.html'], ['templates', 'widgets']).on('change', reload);
    gulp.watch('app/styles/*.*', ['styles']);
    gulp.watch('app/scripts/*.*', ['scripts']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});


gulp.task('serve:test', ['scripts'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/bower_components': 'bower_components'
      }
    }
  });
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe($.filter(file => file.stat && file.stat.size))
    .pipe(wiredep({
      exclude: ['font-awesome'],
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));
  gulp.src('app/_layout.html')
    .pipe(wiredep({
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({
    title: 'build',
    gzip: true
  }));
});

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean', 'wiredep'], 'build', resolve);
  });
});

// Desk Related Functionality
gulp.task('header', function () {
  gulp.src(['app/header.html'])
    .pipe(replace({
      patterns: [{
        match: /<style>/g,
        replacement: '<link href="<%= urlpath %>/styles/main.css" rel="stylesheet"/>'
      }]
    }))
    .pipe(gulp.dest('dist'))
});
gulp.task('cleanup', function () {
  gulp.src('app/_layout.html')
    .pipe(deleteLines({
      'filters': [
        /<script/i,
        /<link/i,
        /<meta/i,
        /<html/i,
        /<.head>/g,
        /<head>/g,
        /<body/i,
        /<.body/i,
        /<!-- bower/g,
        /<!-- build/g,
        /<!-- place/g,
        /<!-- end/g,
        /<!-- header/g,
        /<!doctype/g,
        /<title/g,
        /<!-- Place/g,
        /<.head>/g
      ]
    }))
    .pipe(replace({
      patterns: [{
        match: /{% block main %}\n{% endblock %}/g,
        replacement: fs.readFileSync('.tmp/body.liquid', 'utf8')
      }, {
        match: /<.html>/g,
        replacement: '<script src="<%= urlpath %>/scripts/main.js" type"text/javascript"></script>'
      }]
    }))
    .pipe(htmlreplace({
      'page_index': '{% if page  == "page_index" %}',
      'endblock': '',
      'css': '',
      'js': '<script src="s3://derp///scripts/main.js" type"text/javascript"></script>'
    }))
    .pipe(removeEmptyLines())
    .pipe(gp_rename('body.liquid'))
    .pipe(gulp.dest('dist'));
});
gulp.task('layout', function () {
  gulp.src('app/_layout.html')
    .pipe(deleteLines({
      'filters': [
        /<script/i,
        /<link/i,
        /<meta/i,
        /<html/i,
        /<.html/i,
        /<.head>/i,
        /<head>/i,
        /<body/i,
        /<.body/i,
        /<!-- bower/g,
        /<!-- build/g,
        /<!-- place/g,
        /<!-- end/g,
        /<!-- header/g,
        /<!doctype/g,
        /<title/g,
        /<!-- Place/g,
        /<.head>/g
      ]
    }))
    .pipe(replace({
      patterns: [{
        match: /{% block main %}\n{% endblock %}/g,
        replacement: '{{desk:body}}'
      }]
    }))
    .pipe(htmlreplace({
      'page_index': '{% if page  == "page_index" %}',
      'endblock': '',
      'css': '',
      'js': ''
    }))
    .pipe(removeEmptyLines())
    .pipe(gp_rename('layout.liquid'))
    .pipe(gulp.dest('dist'));
});
gulp.task('body', function () {
  return gulp.src([
      'app/pages/index.html',
      'app/pages/article.html',
      'app/pages/topic.html',
      'app/pages/search.html',
      'app/pages/question-show.html',
      'app/pages/question.html',
      'app/pages/question-precreate.html',
      'app/pages/email.html',
      'app/pages/email-precreate.html',
      'app/pages/email-sent.html',
      'app/pages/chat.html',
      'app/pages/chat-precreate.html',
      'app/pages/myportal.html',
      'app/pages/myportal-show.html',
      'app/pages/login.html',
      'app/pages/register.html',
      'app/pages/forgot.html',
      'app/pages/myaccount.html',
      'app/pages/verification.html',
      'app/pages/csat.html',
      'app/pages/csat-sent.html'
    ])
    .pipe(htmlreplace({
      'page_index': '<!--begin:portal_body-->\n{% if page  == "page_index" %}\n<!--begin:page_index-->\n',
      'page_article': '<!--end:page_index-->\n{% elsif page == "page_article" %}\n<!--begin:page_article-->',
      'page_topic': '<!--end:page_article-->\n{% elsif page == "page_topic" %}\n<!--begin:page_topic-->',
      'page_search_result': '<!--end:page_topic-->\n{% elsif page == "page_search_result" %}\n<!--begin:page_search_result-->',
      'question_show': '<!--end:page_search_result-->\n{% elsif page == "question_show" %}\n<!--begin:question_show-->',
      'question_new': '<!--end:question_show-->\n{% elsif page == "question_new" %}\n<!--begin:question_new-->',
      'question_pre_create': '<!--end:question_new-->\n{% elsif page == "question_pre_create" %}\n<!--begin:question_pre_create-->',
      'email_new': '<!--end:question_pre_create-->\n{% elsif page == "email_new" %}\n<!--begin:email_new-->',
      'email_pre_create': '<!--end:email_new-->\n{% elsif page == "email_pre_create" %}\n<!--begin:email_pre_create-->',
      'email_submitted': '<!--end:email_pre_create-->\n{% elsif page == "email_submitted" %}\n<!--begin:email_submitted-->',
      'chat_new': '<!--end:email_submitted-->\n{% elsif page == "chat_new" %}\n<!--begin:chat_new-->',
      'chat_pre_create': '<!--end:chat_new-->\n{% elsif page == "chat_pre_create" %}\n<!--begin:chat_pre_create-->',
      'myportal_index': '<!--end:chat_pre_create-->\n{% elsif page == "myportal_index" %}\n<!--begin:myportal_index-->',
      'myportal_show': '<!--end:myportal_index-->\n{% elsif page == "myportal_show" %}\n<!--begin:myportal_show-->',
      'login': '<!--end:myportal_show-->\n{% elsif page == "login" %}\n<!--begin:login-->',
      'registration': '<!--end:login-->\n{% elsif page == "registration" %}\n<!--begin:registration-->',
      'forgot_password': '<!--end:registration-->\n{% elsif page == "forgot_password" %}\n<!--begin:forgot_password-->',
      'myaccount': '<!--end:forgot_password-->\n{% elsif page == "myaccount" %}\n<!--begin:myaccount-->',
      'authentication_verification': '<!--end:myaccount-->\n{% elsif page == "authentication_verification" %}\n<!--begin:authentication_verification-->',
      'customer_feedback': '<!--end:authentication_verification-->\n{% elsif page == "customer_feedback" %}\n<!--begin:customer_feedback-->',
      'customer_feedback_completed': '<!--end:customer_feedback-->\n{% elsif page == "customer_feedback_completed" %}\n<!--begin:customer_feedback_completed-->',
      'endblock': '',
      'deskbody': '{{desk:body}}',
      'bodyclose': '<!--end:customer_feedback_completed-->\n{%endif%}\n<!--end:portal_body-->'
    }))
    .pipe(removeEmptyLines())
    .pipe(gp_concat('body.liquid'))
    .pipe(gulp.dest('.tmp'))
});
gulp.task('inner-pages', function () {
  return gulp.src([
      'app/pages/index.html',
      'app/pages/article.html',
      'app/pages/topic-article.html',
      'app/pages/search.html',
      'app/pages/question-show.html',
      'app/pages/question.html',
      'app/pages/question-precreate.html',
      'app/pages/email.html',
      'app/pages/email-precreate.html',
      'app/pages/email-sent.html',
      'app/pages/chat.html',
      'app/pages/chat-precreate.html',
      'app/pages/myportal.html',
      'app/pages/myportal-show.html',
      'app/pages/login.html',
      'app/pages/register.html',
      'app/pages/forgot.html',
      'app/pages/myaccount.html',
      'app/pages/verification.html',
      'app/pages/csat.html',
      'app/pages/csat-sent.html'
    ])
    .pipe(htmlreplace({
      'page_index': 'derp',
      'page_article': '',
      'page_topic': '',
      'page_search_result': '',
      'question_show': '',
      'question_new': '',
      'question_pre_create': '',
      'email_new': '',
      'email_pre_create': '',
      'email_submitted': '',
      'chat_new': '',
      'chat_pre_create': '',
      'myportal_index': '',
      'myportal_show': '',
      'login': '',
      'registration': '',
      'forgot_password': '',
      'myaccount': '',
      'authentication_verification': '',
      'customer_feedback': '',
      'customer_feedback_completed': '',
      'endblock': '',
      'deskbody': '{{desk:body}}',
      'bodyclose': ''
    }))
    .pipe(deleteLines({
      'filters': [
        /<!--end:/g
      ]
    }))
    .pipe(removeEmptyLines())
    .pipe(gulp.dest('dist/theme'))
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: extraPaths
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist/styles'))
});

gulp.task('desk', function (done) {
  runSequence('inner-pages', 'body', 'layout', 'cleanup', 'header', function () {
    done();
    console.log('Body, Scripts and Styles are now ready for your Desk.com site');
  });
});

