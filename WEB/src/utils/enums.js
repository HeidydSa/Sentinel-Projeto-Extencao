export class EnumStatusProjeto {
  static NAO_INICIADO = 'nao_iniciado';
  static EM_PRODUCAO = 'em_producao';
  static FINALIZADO = 'finalizado';

  static getLabel(status) {
    switch (status) {
      case EnumStatusProjeto.NAO_INICIADO:
        return 'Não iniciado';
      case EnumStatusProjeto.EM_PRODUCAO:
        return 'Em produção';
      case EnumStatusProjeto.FINALIZADO:
        return 'Finalizado';
      default:
        return status;
    }
  }

  static get(status) {
    switch (status) {
      case EnumStatusProjeto.NAO_INICIADO:
      case EnumStatusProjeto.EM_PRODUCAO:
      case EnumStatusProjeto.FINALIZADO:
        return status;
      default:
        throw new Error(`Status de projeto desconhecido: ${status}`);
    }
  }

  static getCSSClass(status) {
    switch (status) {
      case EnumStatusProjeto.NAO_INICIADO:
        return 'status-badge--naoiniciado';
      case EnumStatusProjeto.EM_PRODUCAO:
        return 'status-badge--producao';
      case EnumStatusProjeto.FINALIZADO:
        return 'status-badge--finalizado';
      default:
        throw new Error(
          `Classe CSS para status de projeto desconhecido: ${status}`
        );
    }
  }
}
