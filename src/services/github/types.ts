export default class Repository {
  public readonly orgName: string;
  public readonly repoName: string;

  constructor(public readonly fullName: string) {
    this.orgName = fullName.split('/')[0];
    this.repoName = fullName.split('/')[1];
  }
}
