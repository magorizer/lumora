import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CourseUnit, ProgramItem, ProgramPeriod, ProgramSequenceSession, ProgramWeek } from '../../core/models/content.models';
import { UserFlowService } from './user-flow.service';

export interface GoalOption {
  label: string;
  scenarioId: string;
}

@Injectable({ providedIn: 'root' })
export class UserFlowUiService {
  private readonly router = inject(Router);
  private readonly flow = inject(UserFlowService);

  readonly generationPhase = signal(0);
  readonly lessonPlaying = signal(false);
  readonly selectedLesson = signal<ProgramItem | null>(null);
  readonly weekPreview = signal<ProgramWeek | null>(null);

  readonly activeLesson = computed(() =>
    this.selectedLesson() ?? this.flow.scenario()?.weeks[2]?.items[0] ?? null,
  );

  readonly ratingValues = [1, 2, 3, 4, 5];
  readonly generationStages = [
    'Célok értelmezése',
    '9 kurzus összevetése',
    'Napi ritmus kialakítása',
    '12 hetes útvonal felépítése',
  ];

  readonly goalOptions: GoalOption[] = [
    { label: 'Önbizalom', scenarioId: 'confidence' },
    { label: 'Kapcsolatok', scenarioId: 'relationships' },
    { label: 'Stresszkezelés', scenarioId: 'confidence' },
    { label: 'Kommunikáció', scenarioId: 'relationships' },
    { label: 'Fókusz', scenarioId: 'confidence' },
    { label: 'NLP', scenarioId: 'relationships' },
  ];

  readonly situationOptions = ['inkább elakadtam', 'már elindultam', 'rendszert keresek', 'nagy változást szeretnék'];
  readonly obstacleOptions = ['halogatás', 'önbizalomhiány', 'stressz', 'időhiány', 'kapcsolati nehézségek', 'szétszórtság'];
  readonly timeOptions = ['15–30 perc', '1 óra', '2–3 óra', 'rugalmas'];
  readonly formatOptions = ['videó', 'hanganyag', 'rövid feladatok', 'vezetett gyakorlat', 'meditáció'];
  readonly paceOptions = ['könnyed', 'kiegyensúlyozott', 'intenzívebb'];
  readonly adjustmentOptions = ['más fókusz', 'kevesebb idő hetente', 'több hanganyag', 'több gyakorlat', 'esti meditáció', 'reggeli mikro-rutin', 'könnyebb tempó', 'intenzívebb tempó'];
  readonly adjustmentReasons = ['kevesebb időm van', 'más lett a prioritás', 'valami nem működött', 'inkább gyakorlatiasabbat szeretnék'];

  private timer: number | undefined;

  private readonly routes: Record<number, string> = {
    1: '/goals',
    2: '/questionnaire/situation',
    3: '/questionnaire/preferences',
    4: '/profile-summary',
    5: '/generating',
    6: '/program',
    7: '/program-adjustment',
    8: '/week',
    9: '/lesson',
    10: '/feedback',
    11: '/review',
    12: '/next-cycle',
  };

  goStep(step: number): void {
    void this.router.navigateByUrl(this.routes[Math.min(12, Math.max(1, step))] ?? '/goals');
  }

  openWeekPreview(week: ProgramWeek): void {
    this.weekPreview.set(week);
  }

  closeWeekPreview(): void {
    this.weekPreview.set(null);
  }

  openProgramItem(item: ProgramItem): void {
    this.selectedLesson.set(item);
    this.lessonPlaying.set(false);
    void this.router.navigateByUrl(item.type === 'feedback' ? '/feedback' : '/lesson');
  }

  openCourseUnit(courseId: string, unit: CourseUnit, timeLabel: string): void {
    const timeOfDay: ProgramItem['timeOfDay'] =
      timeLabel.includes('reggel') || timeLabel.includes('ébredés')
        ? 'morning'
        : timeLabel.includes('este') || timeLabel.includes('lefekvés')
          ? 'evening'
          : 'daytime';

    this.selectedLesson.set({
      type: unit.type,
      title: unit.title,
      duration: unit.duration,
      courseId,
      unitId: unit.id,
      timeOfDay,
    });
    this.lessonPlaying.set(false);
    void this.router.navigateByUrl('/lesson');
  }

  openTemplateSession(session: ProgramSequenceSession, period: ProgramPeriod): void {
    const type: ProgramItem['type'] =
      session.type === 'meditation'
        ? 'meditation'
        : session.type === 'breathwork'
          ? 'audio'
          : 'exercise';

    this.selectedLesson.set({
      type,
      title: session.title,
      duration: session.duration,
      timeOfDay: period,
    });
    this.lessonPlaying.set(false);
    void this.router.navigateByUrl('/lesson');
  }

  chooseGoal(option: GoalOption): void { this.flow.setMainGoal(option.label, option.scenarioId); }
  setLongTermGoal(event: Event): void { this.flow.patch({ longTermGoal: (event.target as HTMLTextAreaElement).value }); }
  setMainGoalText(event: Event): void { this.flow.patch({ mainGoal: (event.target as HTMLTextAreaElement).value }); }
  setNote(event: Event): void { this.flow.patch({ note: (event.target as HTMLTextAreaElement).value }); }
  setTaskResponse(event: Event): void { this.flow.patch({ taskResponse: (event.target as HTMLTextAreaElement).value }); }
  setLessonReflection(event: Event): void { this.flow.patch({ lessonReflection: (event.target as HTMLTextAreaElement).value }); }
  acceptAffirmation(): void { this.flow.patch({ affirmationAccepted: true }); }

  restart(): void {
    this.flow.reset();
    this.selectedLesson.set(null);
    this.weekPreview.set(null);
    this.goStep(1);
  }

  startGeneration(): void {
    this.stopGeneration();
    this.generationPhase.set(0);

    this.timer = window.setInterval(() => {
      if (this.generationPhase() >= 4) {
        this.stopGeneration();
        return;
      }
      this.generationPhase.update((value) => value + 1);
    }, 1100);
  }

  stopGeneration(): void {
    if (this.timer !== undefined) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
