export class ClassMapper<Entity, Dto> {
  constructor(
    private readonly entityClass: new () => Entity,
    private readonly dtoClass: new () => Dto,
  ) {}

  public toDto(entity: Entity): Dto {
    return Object.assign(
      new this.dtoClass(),
      entity,
    );
  }

  public toEntity(dto: Dto): Entity {
    return Object.assign(
      new this.entityClass(),
      dto,
    );
  }

  public allToDto(entities: Entity[]): Dto[] {
    return entities.map(entity => this.toDto(entity));
  }

  public allToEntity(dtos: Dto[]): Entity[] {
    return dtos.map(dto => this.toEntity(dto));
  }
}
