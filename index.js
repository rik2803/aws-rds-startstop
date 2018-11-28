exports.handler = (event, context, callback) => {

    const AWS = require('aws-sdk');
    const rds = new AWS.RDS();

    // For Aurora DBs
    rds.describeDBClusters({}, function (rdserr, rdsdata) {
        if (rdserr) {
            console.log("ERROR - ERROR")
            callback(rdsdata, null)
        } else {
            console.log("RUNNING")
    
            rdsdata.DBClusters.forEach(function (dbCluster) {
                const rdstagParams = {
                    ResourceName: dbCluster.DBClusterArn
                }
                const currentStatus = dbCluster.Status
    
                console.log(dbCluster.DBClusterArn)
                console.log(dbCluster.Status)
    
                rds.listTagsForResource(rdstagParams, function (tagerr, tagdata) {
                    let toStartup = 0
                    let toShutdown = 0
    
                    // an error occurred
                    if ( !!tagerr ) {
                        return callback({
                            error: tagerr,
                            stack: tagerr.stack
                        }, null)
                    }    
    
                    const tags = tagdata.TagList || []
                    tags.forEach(function (tag) {
                        if (tag.Key === 'RDSDesiredState' && tag.Value === 'stopped') {
                            console.log("Tag found, value is " + tag.Value);
                            toShutdown = 1
                        } else if ( tag.Key === 'RDSDesiredState' && tag.Value === 'started' ) {
                            console.log("Tag found, value is " + tag.Value);
                            toStartup = 1
                        } else {
                            console.log("No RDSDesiredState tag found, leaving the DB in its current state")
                        }
                    })
    
                    if (toStartup) {
                        if (currentStatus !== 'available') {
                            const startparams = {
                                DBClusterIdentifier: dbCluster.DBClusterIdentifier /* required */
                            }
                            console.log("Starting RDS Cluster " + dbCluster.DBClusterIdentifier);
                            rds.startDBCluster(startparams, function (starterr, startdata) {
                                if (starterr)
                                    callback(starterr, null)
                                else
                                    callback(null, startdata)
                            })
                        } else {
                            console.log("Instance in state " + currentStatus + "; no need to start RDS instance")
                        }
                    }
    
                    if (toShutdown === 1) {
                        if (currentStatus === 'available') {
                            const shutdownparams = {
                                DBClusterIdentifier: dbCluster.DBClusterIdentifier
                            }
                            console.log("Stopping RDS Cluster " + dbCluster.DBClusterIdentifier);
                            rds.stopDBCluster(shutdownparams, function (stoperr, stopdata) {
                                if (stoperr)
                                    callback(stoperr, null)
                                else
                                    callback(null, stopdata)
                            })
                        } else {
                            console.log("Instance in state " + currentStatus + " - no need to stop RDS instance")
                        }
                    }
                })
            })
        }
    })

    // For non-aurora DBs
    rds.describeDBInstances({}, function (rdserr, rdsdata) {
        if (rdserr) {
            console.log("ERROR - ERROR")
            callback(rdsdata, null)
        } else {
            console.log("RUNNING")
    
            rdsdata.DBInstances.forEach(function (dbInstance) {
                const rdstagParams = {
                    ResourceName: dbInstance.DBInstanceArn
                }
                const currentStatus = dbInstance.DBInstanceStatus
    
                console.log(dbInstance.DBInstanceArn)
    
                rds.listTagsForResource(rdstagParams, function (tagerr, tagdata) {
                    let toStartup = 0
                    let toShutdown = 0
    
                    // an error occurred
                    if ( !!tagerr ) {
                        return callback({
                            error: tagerr,
                            stack: tagerr.stack
                        }, null)
                    }    
    
                    const tags = tagdata.TagList || []
                    tags.forEach(function (tag) {
                        if (tag.Key === 'RDSDesiredState' && tag.Value === 'stopped') {
                            console.log("Tag found, value is " + tag.Value);
                            toShutdown = 1
                        } else if ( tag.Key === 'RDSDesiredState' && tag.Value === 'started' ) {
                            console.log("Tag found, value is " + tag.Value);
                            toStartup = 1
                        } else {
                            console.log("No RDSDesiredState tag found, leaving the DB in its current state")
                        }
                    })
    
                    if (toStartup) {
                        if (currentStatus !== 'available') {
                            const startparams = {
                                DBInstanceIdentifier: dbInstance.DBInstanceIdentifier /* required */
                            }
                            console.log("Starting RDS Instance");
                            rds.startDBInstance(startparams, function (starterr, startdata) {
                                if (starterr)
                                    callback(starterr, null)
                                else
                                    callback(null, startdata)
                            })
                        } else {
                            console.log("Instance in state " + currentStatus + "; no need to start RDS instance")
                        }
                    }
    
                    if (toShutdown === 1) {
                        if (currentStatus === 'available') {
                            const shutdownparams = {
                                DBInstanceIdentifier: dbInstance.DBInstanceIdentifier
                            }
                            console.log("Stopping RDS Instance");
                            rds.stopDBInstance(shutdownparams, function (stoperr, stopdata) {
                                if (stoperr)
                                    callback(stoperr, null)
                                else
                                    callback(null, stopdata)
                            })
                        } else {
                            console.log("Instance in state " + currentStatus + " - no need to stop RDS instance")
                        }
                    }
                })
            })
        }
    })
}
