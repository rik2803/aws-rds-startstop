# Lambda function to stop/start RDS instances

## Overview

The *Lambda* function start or stops all RDS instances and RDS Clusters in an
account based on a tag assigned to the RDS instance/cluster.

RDS instances and clusters can only be stopped for 7 days and will be restarted
automatically by AWS after that period. But sometimes, a RDS instance is only
rarely used, and it's really annoying to have to think about stopping the instance
every week.

This Lambda function can help to make sure your DB remains in a stopped state
(most of the time).

OK, this is not the whole truth, because a RDS instance can only be stopped when
it is running. This implies an average uptime of 30 minutes a week when the
trigger for the Lambda function goes off once per hour.

## Supported tags

### `RDSDesiredState`

#### Allowed values

* `stopped`: when the function is run, and the instance state is `available`,
  the instance will be stopped
* `started`: when the function is run, and the instance state is not `available`,
  the instance will be started

## Requirements for the Lambda function

### A policy (inline or not)

The policy has to be attached to the role, and allows the *Lambda* function to
perform certain actions on the RDS instances.

The policy document can be found in the file `lambda-rds-start-stop-policy.json`, a good name for the policy could be `RDSStartStopInstances` and the description I used is:

> Allows the role or user or group with the policy to start and stop all the RDS instances in the account.

**Important**: For the Cluster implementation, I had to grant the Lambda permissions on
**all** actions for this to work. I would have expected `rds:StopDBCluster` or
`rds:StartDBCluster` actions, but they do not exist. I'm waiting for feedback on this
in a AWS Support case I logged (CaseId: 5555633581).

### A role 

The role has to be attached to the function as _Execution Role_. Assign the policy from the previous step to the role, and use the file `lambda-rds-start-stop-trust-relationship.json` to define the trust relationship.

A nice name for the role could be `LambdaExecutionRoleRDSStartStopInstances`.

### A trust relationship

### A cloudwatch timed trigger

Create a timed trigger in _CloudWatch_ and use it as a trigger for
the Lambda function. Name the trigger `FireEveryHour`, for example.

And set the _Schedule expression_ to `rate(1 hour)`.

### The function

Use the function from the file `index.js`. When defining the function, a trigger
has to be created. The trigger will start the Lambda function once every x minutes,
the function will loop over all RDS instances, check the `DesiredState` tag and
will act accordingly.

The name of the Lambda function could be `RDSStartStopInstances`. Use `Node.js 8.10`
as the Lambda runtime.

Choose the role from ome of the previous step to grant the required permissions
to the *Lambda* function.

Allow the function to run for 30 seconds.
