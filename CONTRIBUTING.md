Thank you for your interest in becoming a contributor to screenREC. We appreciate all contributions, no matter how large or small. Please take a moment to review this document in order to make effective contributions.

- Take a look at the existing [Issues](https://github.com/heysagnik/screenREC/issues) or [create a new issue](https://github.com/heysagnik/screenREC/issues/new/choose)!
- [Fork the Repo](https://github.com/heysagnik/screenREC/fork). Then, create a branch for any issue that you are working on. Finally, commit your work.
- Create a **[Pull Request](https://github.com/heysagnik/screenREC/compare)** (_PR_), which will be promptly reviewed and given suggestions for improvements by the community.
- Add screenshots or screen captures to your Pull Request to help us understand the effects of the changes proposed in your PR.

## <a name="issue"></a>Report a Bug here

If you fiind a bug that can be fixed potentially by you or someone else, open an issue to let others know! Please add all the necessary information needed and how can the bug be traced and the steps to follow to reach to this bug.

[Open an issue](https://github.com/TechSquidTV/Shoutify/issues/new/choose)

## <a name="feature"></a>Request a Feature

Would you like to see a new feature added to Shoutify? Let's discuss it! Let us know what is in your mind and we would love to add it to the project if it fits with the project!

[Open an issue](https://github.com/TechSquidTV/Shoutify/issues/new/choose)

## Steps to open a Pull Request:

**1.** Start by making a Fork of the [project](https://github.com/heysagnik/screenREC) repository. Click on the <a href="https://github.com/heysagnik/screenREC/fork"><img src="https://i.imgur.com/G4z1kEe.png" height="21" width="21"></a>Fork symbol at the top right corner.

**2.** Clone your new fork for the terminal: 

```bash
git clone https://github.com/<your-github-username>/screenREC
```

**3.** Move to the newly created screenREC project directory:

```bash
cd screenREC
```

**4.** Set upstream command:

```bash
git remote add upstream https://github.com/heysagnik/screenREC.git
```

**5.** Create a new branch:

```bash
git checkout -b YourBranchName
```

**6.** Sync your fork or your local repository with the origin repository:

- In your forked repository, click on "Fetch upstream"
- Click "Fetch and merge"

### Alternatively, Git CLI way to Sync forked repository with origin repository:

```bash
git fetch upstream
```

```bash
git merge upstream/main
```

### [Github Docs](https://docs.github.com/en/github/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-on-github) for Syncing

**7.** Make your changes to the source code.

**8.** Stage your changes:

```bash
git add public
```

_or_

```bash
git add "<files_you_have_changed>"
```

**9.** Commit your changes:

```bash
git commit -m "<your_commit_message>"
```

**10.** Push your local commits to the remote repository:

```bash
git push origin YourBranchName
```

**11.** Create a [Pull Request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request)!

-----

#### Commit Message Format

- Add relevant heading
- Provide short description with the change that has been done



