export interface UpdateQuery<T> {
    id: string;
    data: Partial<Omit<T, 'id'>>;
}
