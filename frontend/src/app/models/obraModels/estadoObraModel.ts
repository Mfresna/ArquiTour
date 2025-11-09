export enum EstadoObraModel {
  DEMOLICION = 'DEMOLICION',
  CONSTRUCCION = 'CONSTRUCCION',
  PROYECTO = 'PROYECTO',
  FINALIZADA = 'FINALIZADA',
}

/** Descripciones legibles para mostrar en la UI */
export const EstadoObraDescripcion: Record<EstadoObraModel, string> = {
  [EstadoObraModel.DEMOLICION]: 'Demolición',
  [EstadoObraModel.CONSTRUCCION]: 'En construcción',
  [EstadoObraModel.PROYECTO]: 'En proyecto',
  [EstadoObraModel.FINALIZADA]: 'Finalizada',
};