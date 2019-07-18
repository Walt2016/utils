var shell = require('shelljs');
//检查控制台是否以运行`git `开头的命令
if (!shell.which('git')) {
    //在控制台输出内容
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
  }

// if (shell.exec('npm run build').code !== 0) {
//   shell.echo('Error: Git commit failed');
//   shell.exit(1);
// }

//并切换到对应目录。
// shell.cp ('-r', './dist/*', '../../target');
// shell.cd('../../target');

shell.exec('git add .');
shell.exec("git commit -m 'autocommit'")
shell.exec('git push')
