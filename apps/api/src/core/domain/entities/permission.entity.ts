export class Permission {
  constructor(
    public readonly id: number,
    public readonly slug: string,
    public readonly description: string | null,
  ) {}
}
