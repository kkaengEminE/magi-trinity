import { PersonaOpinion, ChamberVerdict, ChamberResult } from '@/types';

export function tallyChamber(
  chamberId: number,
  type: 'independent' | 'collaborative',
  opinions: [PersonaOpinion, PersonaOpinion, PersonaOpinion],
): ChamberResult {
  const approveCount = opinions.filter(o => o.vote === 'APPROVE').length;
  const rejectCount = opinions.filter(o => o.vote === 'REJECT').length;
  const verdict: ChamberVerdict = approveCount > rejectCount ? 'APPROVE' : 'REJECT';

  return {
    chamberId,
    type,
    opinions,
    approveCount,
    rejectCount,
    verdict,
  };
}

export function tallyAll(chambers: ChamberResult[]): {
  totalApprove: number;
  totalReject: number;
  overallVerdict: ChamberVerdict;
} {
  const totalApprove = chambers.filter(c => c.verdict === 'APPROVE').length;
  const totalReject = chambers.filter(c => c.verdict === 'REJECT').length;
  return {
    totalApprove,
    totalReject,
    overallVerdict: totalApprove > totalReject ? 'APPROVE' : 'REJECT',
  };
}
