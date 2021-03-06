import React, { useCallback, useEffect, useState } from 'react'
import LinksQueueActionButtons from './component/LinksQueueActionButtons'

const LinksQueueActions = ({ queue, onQueueAction: requestQueueOperation }) => {
  const [queueStatus, setQueueStatus] = useState(null)

  const requestQueueStatusUpdate = ({ type, onSuccessMsg, onErrorMsg }) =>
    requestQueueOperation({ type })
      .then(() => setQueueStatus({ message: onSuccessMsg }))
      .catch(error => setQueueStatus({ message: onErrorMsg(error) }))

  const queueStart = () =>
    requestQueueStatusUpdate({
      type: 'start',
      onSuccessMsg: 'Comenzado!',
      onErrorMsg: error => `No se pudo empezar. ${error ? error.message || error : ''}`,
    })

  const queuePause = () =>
    requestQueueStatusUpdate({
      type: 'pause',
      onSuccessMsg: 'Pausado',
      onErrorMsg: error => `No se pudo pausar. ${error ? error.message || error : ''}`,
    })

  const queueResume = () =>
    requestQueueStatusUpdate({
      type: 'resume',
      onSuccessMsg: 'Continuando',
      onErrorMsg: error => `No se pudo continuar. ${error ? error.message || error : ''}`,
    })

  const queueStop = () =>
    requestQueueStatusUpdate({
      type: 'stop',
      onSuccessMsg: 'Finalizado',
      onErrorMsg: error => `No se pudo finalizar. ${error ? error.message || error : ''}`,
    })

  const handleQueueStartAction = useCallback(queueStart, [])
  const handleQueuePauseAction = useCallback(queuePause, [])
  const handleQueueResumeAction = useCallback(queueResume, [])
  const handleQueueStopAction = useCallback(queueStop, [])

  // cleanup queueStatus after 3 secs
  useEffect(() => {
    const timeout = setTimeout(() => setQueueStatus(null), 3000)
    return () => clearTimeout(timeout)
  }, [queueStatus])

  return <>
    <LinksQueueActionButtons queue={queue}
                             onStartAction={handleQueueStartAction}
                             onPauseAction={handleQueuePauseAction}
                             onStopAction={handleQueueStopAction}
                             onResumeAction={handleQueueResumeAction}
    />
    {queueStatus && (
      <>
        <br/>
        <span>{queueStatus.message}</span>
      </>
    )}
  </>
}

export default LinksQueueActions
