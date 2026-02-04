export interface FaqItem {
  question: string;
  answer: string;
}

export const PRESTAMO_FAQS: FaqItem[] = [
  {
    question: '¿Qué es un Préstamo Preconcedido?',
    answer: 'Es un préstamo personal que el banco te ofrece con una cantidad y condiciones ya aprobadas según tu perfil. Puedes contratarlo online en pocos minutos, sin necesidad de adjuntar documentación adicional, y recibir el dinero en tu cuenta en menos de 24 horas.'
  },
  {
    question: '¿Qué características tiene el Préstamo Preconcedido Online?',
    answer: 'El préstamo preconcedido online permite solicitar hasta 45.000 € con varios plazos de amortización (entre 30 y 96 meses). El proceso es 100 % digital: personalizas la cuota, revisas los detalles, firmas el contrato electrónicamente y el importe se ingresa en la cuenta que elijas.'
  },
  {
    question: '¿Qué ocurre si solicito un importe que supera el límite de contratación preconcedido?',
    answer: 'Si solicitas un importe superior al preconcedido, la solicitud se evaluará como una nueva operación. En ese caso, el banco podría pedir documentación complementaria y el plazo de resolución puede ser mayor. Te recomendamos no superar el límite indicado para mantener la agilidad del proceso.'
  },
  {
    question: '¿Cuál es el plazo de reembolso para un Préstamo Preconcedido?',
    answer: 'Puedes elegir el plazo de reembolso según tu conveniencia. Los plazos disponibles suelen ir desde 30 meses hasta 96 meses (8 años), en función del importe y de tu perfil. A mayor plazo, la cuota mensual es menor, pero el total de intereses será mayor.'
  },
  {
    question: '¿Qué ocurre si me retraso en el pago de mi Préstamo Preconcedido Online?',
    answer: 'En caso de retraso en el pago, se aplicarán los intereses de demora y, si el impago se prolonga, se podrían iniciar las actuaciones previstas en el contrato. Te recomendamos contactar con el banco ante cualquier dificultad para valorar opciones de refinanciación o modificación de cuotas.'
  }
];

export const SEGURO_FAQS: FaqItem[] = [
  {
    question: '¿Qué cubre y a quién cubre?',
    answer: 'El Seguro de Protección Vida capital constante cubre al titular del préstamo en caso de fallecimiento o incapacidad absoluta y permanente. El capital asegurado se destina a la cancelación o reducción del préstamo, de modo que los beneficiarios o el propio titular no tengan que hacer frente a las cuotas en esas situaciones.'
  },
  {
    question: '¿Existen restricciones en lo que respecta a la cobertura del seguro?',
    answer: 'Sí. La cobertura está sujeta a las condiciones generales y particulares del seguro. No se cubren, entre otros, los siniestros derivados de causas preexistentes no declaradas, determinadas actividades de riesgo o el incumplimiento del deber de veracidad en el cuestionario de salud. Consulta la póliza para el detalle completo.'
  },
  {
    question: '¿Para qué sirve un Seguro de vida y de Capital Constante?',
    answer: 'Sirve para garantizar que, en caso de fallecimiento o incapacidad absoluta del titular, el capital pendiente del préstamo quede cubierto. El capital asegurado se mantiene constante durante la vigencia del préstamo, de modo que la protección se adapta a la evolución de la deuda.'
  },
  {
    question: '¿Tiene algún periodo de carencia?',
    answer: 'El seguro no tiene periodo de carencia en el sentido de suspensión de cuotas del préstamo. La cobertura suele ser efectiva desde el momento de la contratación, salvo que en las condiciones se indique un periodo de espera para determinadas garantías (por ejemplo, suicidio en los primeros meses).'
  },
  {
    question: '¿Puedo cancelar el seguro en cualquier momento?',
    answer: 'Sí. Puedes solicitar la cancelación del seguro en cualquier momento durante la vigencia del préstamo. La baja será efectiva según las condiciones del contrato y no implica la cancelación del préstamo; las cuotas del préstamo seguirán siendo las mismas.'
  }
];
