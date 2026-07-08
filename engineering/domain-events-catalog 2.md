# Domain Events Catalog

This catalog tracks all Domain Events across bounded contexts, establishing clear integration boundaries between the modules.

| Event                          | Producer   | Consumers                                        |
| :----------------------------- | :--------- | :----------------------------------------------- |
| `CommitmentRegistered`         | Commitment | Projection                                       |
| `CommitmentActivated`          | Commitment | Projection, Notifications                        |
| `CommitmentPaused`             | Commitment | Projection, Notifications                        |
| `CommitmentResumed`            | Commitment | Projection, Notifications                        |
| `CommitmentCompleted`          | Commitment | Projection, Notifications, _Recurrence (Future)_ |
| `CommitmentCancelled`          | Commitment | Projection, Notifications                        |
| `CommitmentRenamed`            | Commitment | Projection                                       |
| `CommitmentDescriptionUpdated` | Commitment | Projection                                       |
