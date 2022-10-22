import type Candidate from "$lib/types/Candidate";
import { calculateLumaHEX } from "$lib/utils/luma";

function _fillRegion(mapBind: HTMLDivElement, region: HTMLElement, selectedCandidateId: number, candidates: Candidate[]) {
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId);
  if (selectedCandidate === undefined) {
    return candidates;
  }
  const currentCandidateID = region.getAttribute('candidate') || '-2';
  const currentCandidate = candidates.find((candidate) => candidate.id === parseInt(currentCandidateID));
  if (currentCandidate === undefined) {
    return candidates;
  }

  const value = parseInt(region.getAttribute('value') || '0');
  currentCandidate.margins[0].count -= value;
  selectedCandidate.margins[0].count += value;

  const regionName = region.getAttribute('short-name');

  if (regionName) {
    const text = mapBind.querySelector(`.region-texts [for="${regionName}"]`);
    if (text) {
      const luma = calculateLumaHEX(selectedCandidate.margins[0].color);
      (text as HTMLElement).style.color = luma > 0.5 ? '#000000' : '#ffffff';
    }

    const button = mapBind.querySelector(`.region-buttons [for="${regionName}"]`);
    if (button) {
      (button as HTMLElement).style.fill = selectedCandidate.margins[0].color;
    }
  }

  region.style.fill = selectedCandidate.margins[0].color;
  region.setAttribute('candidate', selectedCandidate.id.toString());

  return candidates;
}

function _editRegion(mapBind: HTMLDivElement, region: HTMLElement, candidates: Candidate[], newValue: number) {
  /* Update value */
  const currentValue = parseInt(region.getAttribute('value') || '0');
  region.setAttribute('value', newValue.toString());

  /* Update candidate margins */
  const currentCandidateID = parseInt(region.getAttribute('candidate') || '-2', 10);
  const currentCandidate = candidates.find((c) => c.id === currentCandidateID);
  if (currentCandidate) {
    currentCandidate.margins[0].count -= currentValue;
    currentCandidate.margins[0].count += newValue;
  }

  /* Update text */
  const shortName = region.getAttribute('short-name');
  const text = mapBind.querySelector(`.region-texts [for="${shortName}"] .bottom`);
  if (text) {
    text.innerHTML = newValue.toString();
  }
  return candidates;
}

export { _fillRegion, _editRegion };