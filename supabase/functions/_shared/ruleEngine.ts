export const evaluateRules = (message: string, aiSeverity: string, taskStatus: string) => {
  let finalStatus = 'DRAFT_ONLY';
  let reason = 'Default action';

  const riskKeywords = ['미끄럼', '기름', '마모', '끊어', '어두'];
  const hasRiskKeyword = riskKeywords.some(kw => message.includes(kw));

  if (aiSeverity === 'HIGH' && hasRiskKeyword) {
    if (taskStatus !== 'BLOCKED') {
      finalStatus = 'APPROVED';
      reason = 'High severity with recognized risk keywords, task not blocked yet.';
    } else {
      finalStatus = 'REJECTED_BY_RULE';
      reason = 'Task is already blocked, redundant alert.';
    }
  } else {
    reason = 'Severity is not HIGH or no critical keywords found.';
  }

  return { status: finalStatus, reason };
};
