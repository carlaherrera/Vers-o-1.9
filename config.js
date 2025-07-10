/**********************************************************************
 *                                                                     *
 *    Cardápio Digital Whatsapp Google Sheets    V1.9                 *
 *                                                                     *
 *    Desenvolvido com ❤️ por Dante Testa                              *
 *    www.dantetesta.com.br | WhatsApp: (19) 99802-9156                *
 *                                                                     *
 *    🚫 AVISO IMPORTANTE 🚫                                           *
 *    Este código é propriedade intelectual de Dante Testa.            *
 *    Não utilize de forma pirata. Valorize o trabalho do              *
 *    desenvolvedor adquirindo uma licença legítima.                   *
 *                                                                     *
 *    💸 APOIE O DESENVOLVEDOR                                         *
 *    Ao comprar o original você apoia um profissional que             *
 *    também tem família e luta todo dia para pagar as contas.         *
 *    Não pegue atalhos - um dia a vida manda a conta das              *
 *    pequenas coisas erradas que fazemos.                             *
 *                                                                     *
 *    💰 Se este script te ajudou a ficar rico e quiser me             *
 *    enviar um presente financeiro: PIX dante.testa@gmail.com         *
 *                                                                     *
 *    🛠️ SUPORTE TÉCNICO [não gratuito]                                *
 *    Disponível via WhatsApp. Entre em contato para consultar         *
 *    valores e planos de suporte personalizados.                      *
 *                                                                     *
 *    "Código é poesia. Respeite o poeta."                             *
 *                                                                     *
 **********************************************************************
 */

/**
 * Configurações do Cardápio Digital
 * Edite apenas este arquivo para personalizar seu cardápio
 * Desenvolvido por Dante Testa (https://dantetesta.com.br)
 */

// URLs das planilhas Google Sheets
const CONFIG_PLANILHAS = {

    itens: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmKIn0n5q4SSSlIDdBu34mW2GcylmU6dcO6hmX2Qi7JQfInuqhQP691vkxsGBAVqdW1DV6ARvMrjJy/pub?gid=1455563459&single=true&output=csv',
  
    categorias: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmKIn0n5q4SSSlIDdBu34mW2GcylmU6dcO6hmX2Qi7JQfInuqhQP691vkxsGBAVqdW1DV6ARvMrjJy/pub?gid=264383639&single=true&output=csv',
   
    config: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmKIn0n5q4SSSlIDdBu34mW2GcylmU6dcO6hmX2Qi7JQfInuqhQP691vkxsGBAVqdW1DV6ARvMrjJy/pub?gid=0&single=true&output=csv'
};