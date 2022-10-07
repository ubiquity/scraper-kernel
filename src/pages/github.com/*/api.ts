import { ITestProtocolResult } from "check-proxy/build/lib/interfaces";
import GitHubRepositories from "./@types/orgs-ORG-repos";
import GitHubContributors from "./@types/repos-ORG-REPO-contributors";
import GitHubProfile from "./@types/users-USER";
import { proxies } from "../_proxy/proxy";

export class GitHubClient {
  public profile = async function fetchProfile(ID: string): Promise<GitHubProfile> {
    // https://api.github.com/users/ubiquity
    return await (await fetch(`https://api.github.com/users/${ID}`)).json();
  };
  public repositoriesFromOrganization = async function fetchRepositoriesFromOrganization(ID: string): Promise<GitHubRepositories> {
    // https://api.github.com/orgs/ubiquity/repos
    return await (await fetch(`https://api.github.com/orgs/${ID}/repos`)).json();
  };
  public contributorsFromRepository = async function fetchContributorsFromRepository(ORG: string, REPO: string): Promise<GitHubContributors> {
    // https://api.github.com/repos/ubiquity/uad-common-contracts-prototyping/contributors
    return await (await fetch(`https://api.github.com/repos/${ORG}/${REPO}/contributors`)).json();
  };
  constructor() {
    this.proxies = {
      list: proxies(),
      checked: [],
    };
  }
  public proxies: {
    list: Promise<string[]>;
    checked: ITestProtocolResult[][];
  };
  ready = async () => {
    try {
      const list = await this.proxies.list;
      const clean = list.filter(Boolean) as string[];
      return clean;
    } catch (error) {
      console.error(error);
    }
  };
}
