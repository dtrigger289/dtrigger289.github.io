gulp.task('encrypt', () => {
  return gulp.src('SRC-FOLDER')
    .pipe(encrypt('PASSWORD'))
    .pipe(gulp.dest('DEST-FOLDER'));
});
