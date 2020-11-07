
const chainAllTasksInSeries = async <T>(tasksFactory: (() => Promise<T>)[]): Promise<T[]> => {
    return tasksFactory.reduce((promiseChain, currentTask) => {
        return promiseChain.then(chainResults =>
            currentTask().then(currentResult =>
                [...chainResults, currentResult]
            )
        );
    }, Promise.resolve<T[]>([]));
}