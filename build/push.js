var shell = require('shelljs');

// if (shell.exec('npm run build').code !== 0) {
//   shell.echo('Error: Git commit failed');
//   shell.exit(1);
// }

//并切换到对应目录。
// shell.cp ('-r', './dist/*', '../../target');
// shell.cd('../../Rychou');

shell.exec('git add .');
shell.exec("git commit -m 'autocommit'")
shell.exec('git push')