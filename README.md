# discover-audits
This is a project for detecting High and Critical vulnerabilities across npm projects

# Getting Started
These instructions will get you up and running with the neccessary tools in order to run project

### Prerequisites
 - Have brew installed: https://brew.sh/
 - Install Node via Terminal:
 - Install GitHub CLI via Terminal:
 
 ```
$ brew install node
$ brew install gh       <-- To be used in future versions - not essential currently
 ```

### Running the project
This project will run on all versions of Node newer than and including 10

1. Run `npm install`


Inside the `run-audit.js` file


2. Set the `path` variable to be the path in which you clone the repos into

3. Set the `org` variable to be the user/organisation

3. Set the `repos` array to contain the repos you wish to check

3. Set the `branch` variable

4. Set the `skipClone` variable to `true` if you already have the repos installed


Via Terminal

5. `node run-audit.js`

And that's it!
based on the values selected above, the script should now begin the process of detecting if there are any vulnerabilites that are deemed High or Critical against the specificed repositories - and then report a list of repos that need manual intervention.
