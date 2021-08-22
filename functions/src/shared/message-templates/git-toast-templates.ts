import { logger } from "firebase-functions";

const GIT_TOAST_PUSH = `<a href="https://github.com/{{pusher}}">{{pusher}}</a> pushed to branch {{branch}} of <a href="{{repoUrl}}">{{repo}}</a>

<b>Commits:</b>
{{commits}}`;

const GIT_TOAST_COMMIT = `<a href="{{url}}">{{commitId}}</a>: {{commitMessage}}`;

function getCommitMessages(commits: any[]): string {
  let commitMessages = "";

  commits.forEach((c) => {
    const id = (c.id as string).substring(0, 8);
    let tempMessage = GIT_TOAST_COMMIT.replace("{{commitId}}", id);
    tempMessage = tempMessage.replace("{{url}}", c.url);
    tempMessage = tempMessage.replace("{{commitMessage}}", c.message);

    commitMessages = commitMessages + tempMessage + "\n";
  });

  return commitMessages;
}

export function getToastPushMessage(
  data: { [key: string]: string },
  commits: any[]
) {
  let message = GIT_TOAST_PUSH;

  Object.keys(data).forEach((key) => {
    message = message.replace(`/{{${key}}}/g`, data[key]);
  });

  logger.debug("COMMITS", commits);

  if (commits && commits.length > 0) {
    let commitMessages = getCommitMessages(commits);
    commitMessages = message.replace("{{commits}}", commitMessages);
    return message;
  }

  return message.replace("{{commits}}", "No commits to display");
}
