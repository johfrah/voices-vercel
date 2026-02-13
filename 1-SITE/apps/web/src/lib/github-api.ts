import { Octokit } from '@octokit/rest';

// 🛡️ SECURITY: GitHub Token Management
const GITHUB_TOKEN = process.env.BOB_GITHUB_TOKEN;
const REPO_OWNER = 'johfrah';
const REPO_NAME = 'voices-vercel';
const BRANCH = 'main';

/**
 * 🐙 GITHUB API CLIENT (Bob's Cloud Hands)
 * 
 * Stelt de applicatie in staat om direct files aan te passen op GitHub,
 * wat een automatische Vercel deploy triggert.
 */

export const getOctokit = () => {
  if (!GITHUB_TOKEN) {
    throw new Error('BOB_GITHUB_TOKEN ontbreekt in environment variables.');
  }
  return new Octokit({ auth: GITHUB_TOKEN });
};

export async function commitFileToGitHub(
  path: string, 
  content: string, 
  message: string
) {
  const octokit = getOctokit();
  
  try {
    // 1. Get current file SHA (if it exists)
    let sha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path,
        ref: BRANCH,
      });
      
      if ('sha' in data) {
        sha = data.sha;
      }
    } catch (e) {
      // File doesn't exist yet, that's fine
    }

    // 2. Create or Update file
    const { data: commit } = await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch: BRANCH,
      committer: {
        name: 'Cody (Vibecode Engine)',
        email: 'cody@voices.be'
      }
    });

    return { success: true, commit };
  } catch (error: any) {
    console.error('❌ GitHub Commit Failed:', error);
    throw new Error(`GitHub Commit Failed: ${error.message}`);
  }
}

export async function triggerWorkflow(workflowId: string, inputs: Record<string, any>) {
  const octokit = getOctokit();
  
  try {
    await octokit.actions.createWorkflowDispatch({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      workflow_id: workflowId,
      ref: BRANCH,
      inputs
    });
    return { success: true };
  } catch (error: any) {
    console.error('❌ Workflow Trigger Failed:', error);
    throw new Error(`Workflow Trigger Failed: ${error.message}`);
  }
}