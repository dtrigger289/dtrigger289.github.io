gulp.task('firewall:encrypt', () => {
  return gulp.src('_protected/*.*')
    .pipe(encrypt('password'))
    .pipe(gulp.dest('_posts'));
});
