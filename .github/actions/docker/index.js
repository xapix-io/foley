const core = require('@actions/core');
const { exec } = require('@actions/exec');

return async function () {
  try {
    const githubSHA = process.env['GITHUB_SHA'];
    const dockerfile = core.getInput('dockerfile_path', { required: true });
    const buildContext = core.getInput('build_context', { required: true });
    var buildParams = core.getInput('build_params');
    const baseName = core.getInput('image_name', { required: true });
    const username = core.getInput('username', { required: true });
    const password = core.getInput('password', { required: true });

    const shaName = `${baseName}:${githubSHA}`;
    const developName = `${baseName}:develop`;

    await exec(`docker login -u ${username} -p ${password}`);
    if (core.getInput('cache')) {
      await exec(`docker pull ${baseName}`);
      buildParams += ` --cache-from ${baseName}`;
    }
    await exec(`docker build ${buildParams} -f ${dockerfile}  -t ${developName} -t ${shaName} ${buildContext}`);
    let promises = [exec(`docker push ${shaName}`)];
    if ('refs/heads/master' == process.env['GITHUB_REF']) {
      promises.push(exec(`docker push ${developName}`));
    }
    await Promise.all(promises);
  } catch (error) {
    core.setFailed(error.message);
  }
}()
