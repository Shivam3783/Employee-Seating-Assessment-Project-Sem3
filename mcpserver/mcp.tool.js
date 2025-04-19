// // mcp.tool.js - GitHub integration using simple-git instead of child_process
// import { config } from "dotenv";
// import simpleGit from 'simple-git';
// import fs from "fs/promises";
// import path from "path";

// config();

// // Setup GitHub credentials from environment variables
// const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
// const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

// // Function to clone a repository if not already cloned
// async function ensureRepoExists(repoUrl, localPath) {
//   try {
//     // Check if directory exists and is a git repo
//     try {
//       await fs.access(path.join(localPath, '.git'));
//       // Directory exists and has .git, return it
//       return localPath;
//     } catch (err) {
//       // Directory doesn't exist or isn't a git repo
//       try {
//         await fs.mkdir(localPath, { recursive: true });
//       } catch (err) {
//         // Ignore if directory already exists
//       }
      
//       // Clone the repository
//       const git = simpleGit();
//       await git.clone(repoUrl, localPath);
//       return localPath;
//     }
//   } catch (error) {
//     throw new Error(`Failed to ensure repo exists: ${error.message}`);
//   }
// }

// // Main function to commit changes to GitHub
// export async function commitToGitHub(branch, commitMessage, repoUrl = null) {
//   try {
//     let workingDir;
    
//     // If repo URL is provided, clone or use existing clone
//     if (repoUrl) {
//       // Extract repo name from URL for local directory
//       const repoName = repoUrl.split('/').pop().replace('.git', '');
//       const localPath = path.join(process.cwd(), repoName);
      
//       // Ensure repo exists locally
//       workingDir = await ensureRepoExists(repoUrl, localPath);
//     } else {
//       // Use current directory
//       workingDir = process.cwd();
//     }
    
//     // Initialize git in the working directory
//     const git = simpleGit(workingDir);
    
//     // Check if it's a git repository
//     const isRepo = await git.checkIsRepo();
//     if (!isRepo) {
//       return {
//         content: [{
//           type: "text",
//           text: `Error: ${workingDir} is not a git repository.`
//         }]
//       };
//     }
    
//     // Get current branch
//     const branchSummary = await git.branch();
    
//     // Check if branch exists
//     const branchExists = branchSummary.all.includes(branch);
    
//     if (!branchExists) {
//       // Create and checkout branch
//       await git.checkoutLocalBranch(branch);
//     } else {
//       // Checkout existing branch
//       await git.checkout(branch);
//     }
    
//     // Add all changes
//     await git.add('.');
    
//     // Check if there are changes to commit
//     const status = await git.status();
    
//     if (status.files.length === 0 && status.staged.length === 0) {
//       return {
//         content: [{
//           type: "text",
//           text: "No changes to commit. Working directory clean."
//         }]
//       };
//     }
    
//     // Commit changes
//     await git.commit(commitMessage);
    
//     // Push changes
//     try {
//       const remoteUrl = repoUrl || await git.remote(['get-url', 'origin']);
      
//       // If we have credentials, use them
//       if (GITHUB_TOKEN && GITHUB_USERNAME) {
//         // Format the authenticated URL
//         const authRemoteUrl = remoteUrl.replace(
//           'https://', 
//           `https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@`
//         );
        
//         // Set the remote URL with auth
//         await git.remote(['set-url', 'origin', authRemoteUrl]);
//       }
      
//       // Push to the branch
//       await git.push(['--set-upstream', 'origin', branch]);
      
//       // If we changed the remote URL, change it back for security
//       if (GITHUB_TOKEN && GITHUB_USERNAME) {
//         await git.remote(['set-url', 'origin', remoteUrl]);
//       }
      
//       return {
//         content: [{
//           type: "text",
//           text: `Successfully committed to branch ${branch} with message: "${commitMessage}" and pushed to remote repository.`
//         }]
//       };
//     } catch (error) {
//       return {
//         content: [{
//           type: "text",
//           text: `Changes committed locally, but push failed: ${error.message}. You may need to push manually.`
//         }]
//       };
//     }
//   } catch (error) {
//     return {
//       content: [{
//         type: "text",
//         text: `Error during GitHub commit operation: ${error.message}`
//       }]
//     };
//   }
// }
// mcp.tool.js - GitHub integration using simple-git (NO CLONING, NO CONFIG OVERWRITE)
import { config } from "dotenv";
import simpleGit from 'simple-git';


config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

export async function commitToGitHub(branch, commitMessage, repoUrl = 'https://github.com/Shivam3783/Employee-Seating-Assessment-Project-Sem3.git') {
  try {
    const workingDir = process.cwd();
    const git = simpleGit(workingDir);


    // Check if current directory is a git repo
    const isRepo = await git.checkIsRepo();
    
    if (!isRepo) {
      // Initialize git in current directory if not already a repo
      await git.init();
      
      // If repo URL provided, set it as origin
      if (repoUrl) {
        await git.addRemote('origin', repoUrl);
      } else {
        return {
          content: [{
            type: "text",
            text: "Error: Not a git repository and no repository URL provided to set as origin."
          }]
        };
      }
    }

    // Check if we have the remote branch
    if (repoUrl) {
      try {
        await git.fetch();
      } catch (fetchError) {
        console.log("Initial fetch failed, might be a new repository");
      }
    }

    // Check if branch exists locally
    const branchSummary = await git.branchLocal();
    const branchExists = branchSummary.all.includes(branch);

    if (!branchExists) {
      // Create new branch
      await git.checkoutLocalBranch(branch);
    } else {
      // Checkout existing branch
      await git.checkout(branch);
    }

    // Add all changes
    await git.add('.');

    // Check status
    const status = await git.status();
    if (status.files.length === 0) {
      return {
        content: [{
          type: "text",
          text: "No changes detected in the current directory to commit."
        }]
      };
    }

    // Commit changes (using existing git config)
    await git.commit(commitMessage);

    // Push changes
    try {
      if (GITHUB_TOKEN && GITHUB_USERNAME) {
        // Temporarily set authenticated remote URL
        const currentRemote = await git.remote(['get-url', 'origin']);
        const authRemote = currentRemote.replace(
          'https://',
          `https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@`
        );
        await git.remote(['set-url', 'origin', authRemote]);
      }

      await git.push('origin', branch);

      // Reset remote URL if we changed it
      if (GITHUB_TOKEN && GITHUB_USERNAME) {
        const currentRemote = await git.remote(['get-url', 'origin']);
        const normalRemote = currentRemote.replace(
          `https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@`,
          'https://'
        );
        await git.remote(['set-url', 'origin', normalRemote]);
      }

      return {
        content: [{
          type: "text",
          text: `Successfully committed and pushed changes to ${branch} branch with message: "${commitMessage}"`
        }]
      };
    } catch (pushError) {
      return {
        content: [{
          type: "text",
          text: `Changes committed locally but push failed: ${pushError.message}. You may need to push manually.`
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }]
    };
  }
}