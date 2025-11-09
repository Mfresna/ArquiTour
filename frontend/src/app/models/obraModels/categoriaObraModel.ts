export enum CategoriaObraModel {
  ARQ_RESIDENCIAL = 'ARQ_RESIDENCIAL',
  ARQ_COMERCIAL = 'ARQ_COMERCIAL',
  ARQ_EDUCACIONAL = 'ARQ_EDUCACIONAL',
  ARQ_CULTURAL = 'ARQ_CULTURAL',
  ARQ_SALUD = 'ARQ_SALUD',
  ARQ_PUBLICA_INSTIT = 'ARQ_PUBLICA_INSTIT',
  ARQ_INDUSTRIAL = 'ARQ_INDUSTRIAL',
  ARQ_DEPORTIVA = 'ARQ_DEPORTIVA',
  ARQ_RELIGIOSA = 'ARQ_RELIGIOSA',
  PAISAJISMO_URBANISMO = 'PAISAJISMO_URBANISMO',
  ARQ_PAT_RESTAUR = 'ARQ_PAT_RESTAUR',
  ARQ_TEMPORARIA = 'ARQ_TEMPORARIA',
}

/** Descripciones legibles equivalentes al `toString()` del backend */
export const CategoriaObraDescripcion: Record<CategoriaObraModel, string> = {
  [CategoriaObraModel.ARQ_RESIDENCIAL]: 'Arquitectura Residencial',
  [CategoriaObraModel.ARQ_COMERCIAL]: 'Arquitectura Comercial',
  [CategoriaObraModel.ARQ_EDUCACIONAL]: 'Arquitectura Educacional',
  [CategoriaObraModel.ARQ_CULTURAL]: 'Arquitectura Cultural',
  [CategoriaObraModel.ARQ_SALUD]: 'Arquitectura de Salud',
  [CategoriaObraModel.ARQ_PUBLICA_INSTIT]: 'Arquitectura Pública e Institucional',
  [CategoriaObraModel.ARQ_INDUSTRIAL]: 'Arquitectura Industrial',
  [CategoriaObraModel.ARQ_DEPORTIVA]: 'Arquitectura Deportiva',
  [CategoriaObraModel.ARQ_RELIGIOSA]: 'Arquitectura Religiosa',
  [CategoriaObraModel.PAISAJISMO_URBANISMO]: 'Paisajismo y Urbanismo',
  [CategoriaObraModel.ARQ_PAT_RESTAUR]: 'Arquitectura Patrimonial y de Restauración',
  [CategoriaObraModel.ARQ_TEMPORARIA]: 'Arquitectura Temporaria (Pabellones, Instalaciones, Stands)',
};