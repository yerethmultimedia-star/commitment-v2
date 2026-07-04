import { UniqueEntityId } from './unique-entity-id.js';

export abstract class Entity<IdType = UniqueEntityId> {
  protected readonly _id: IdType;

  protected constructor(id: IdType) {
    this._id = id;
  }

  public get id(): IdType {
    return this._id;
  }

  public equals(object?: Entity<IdType>): boolean {
    if (object === null || object === undefined) {
      return false;
    }
    if (this === object) {
      return true;
    }
    if (!(object instanceof Entity)) {
      return false;
    }
    const selfId = this._id as unknown as { equals?: (other: IdType) => boolean };
    return this._id === object._id || (typeof selfId.equals === 'function' && selfId.equals(object._id));
  }
}
