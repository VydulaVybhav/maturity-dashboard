'use client';

import { Achievement } from '@/lib/types';
import { Trophy, Sparkles } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface FloatingAchievementsProps {
  achievements: Achievement[];
}

interface MovingAchievement extends Achievement {
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
}

const CARD_WIDTH = 260;
const CARD_HEIGHT = 60;
const SPEED = 0.05; // Slow movement speed

export default function FloatingAchievements({ achievements }: FloatingAchievementsProps) {
  const [movingAchievements, setMovingAchievements] = useState<MovingAchievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (achievements.length === 0) return;

    // Initialize achievements with random positions and velocities
    const initialized = achievements.map((achievement, index) => {
      const isLeft = index % 2 === 0;

      return {
        ...achievement,
        x: isLeft ? Math.random() * 10 : 85 + Math.random() * 10,
        y: 10 + Math.random() * 70,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
      };
    });

    setMovingAchievements(initialized);

    // Animation loop
    const animate = () => {
      setMovingAchievements((prev) => {
        return prev.map((ach, index) => {
          let newX = ach.x + ach.vx;
          let newY = ach.y + ach.vy;
          let newVx = ach.vx;
          let newVy = ach.vy;

          // Convert percentage to pixels for collision detection
          const screenWidth = window.innerWidth;
          const screenHeight = window.innerHeight;
          const pixelX = (newX / 100) * screenWidth;
          const pixelY = (newY / 100) * screenHeight;

          // Bounce off screen edges
          // Left boundary (0%)
          if (newX < 0) {
            newX = 0;
            newVx = Math.abs(newVx);
          }
          // Right boundary (95% - account for card width)
          if (newX > 86) {
            newX = 86;
            newVx = -Math.abs(newVx);
          }
          // Top boundary (10%)
          if (newY < 10) {
            newY = 10;
            newVy = Math.abs(newVy);
          }
          // Bottom boundary (80%)
          if (newY > 80) {
            newY = 80;
            newVy = -Math.abs(newVy);
          }

          // Bounce off center content zone (10-85% width)
          const isLeft = ach.x < 50;
          if (isLeft && newX > 10) {
            newX = 10;
            newVx = -Math.abs(newVx);
          }
          if (!isLeft && newX < 75) {
            newX = 75;
            newVx = Math.abs(newVx);
          }

          // Check collision with other achievements using rectangular (AABB) collision
          prev.forEach((other, otherIndex) => {
            if (index === otherIndex) return;

            const otherPixelX = (other.x / 100) * screenWidth;
            const otherPixelY = (other.y / 100) * screenHeight;

            // Calculate bounding boxes
            const box1 = {
              left: pixelX,
              right: pixelX + CARD_WIDTH,
              top: pixelY,
              bottom: pixelY + CARD_HEIGHT,
            };

            const box2 = {
              left: otherPixelX,
              right: otherPixelX + CARD_WIDTH,
              top: otherPixelY,
              bottom: otherPixelY + CARD_HEIGHT,
            };

            // AABB collision detection
            const isColliding =
              box1.left < box2.right &&
              box1.right > box2.left &&
              box1.top < box2.bottom &&
              box1.bottom > box2.top;

            if (isColliding) {
              // Calculate overlap on each axis
              const overlapX = Math.min(box1.right - box2.left, box2.right - box1.left);
              const overlapY = Math.min(box1.bottom - box2.top, box2.bottom - box1.top);

              // Separate on the axis with smallest overlap
              if (overlapX < overlapY) {
                // Horizontal collision - reverse X velocity
                newVx = pixelX < otherPixelX ? -Math.abs(newVx) : Math.abs(newVx);
              } else {
                // Vertical collision - reverse Y velocity
                newVy = pixelY < otherPixelY ? -Math.abs(newVy) : Math.abs(newVy);
              }
            }
          });

          return {
            ...ach,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [achievements]);

  const getTeamGradient = (achievement: MovingAchievement) => {
    if (achievement.team?.color_from && achievement.team?.color_to) {
      return `linear-gradient(135deg, ${achievement.team.color_from}, ${achievement.team.color_to})`;
    }
    return 'linear-gradient(135deg, #10b981, #14b8a6)'; // Default gradient
  };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {movingAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              left: `${achievement.x}%`,
              top: `${achievement.y}%`,
            }}
            onClick={() => setSelectedAchievement(achievement)}
          >
            <div
              className="group relative bg-slate-900/90 border border-slate-700/50 rounded-lg px-4 py-2.5 hover:bg-slate-900/95 hover:border-slate-600/70 transition-all duration-300 w-[260px]"
              style={{
                borderLeftWidth: '3px',
                borderLeftColor: achievement.team?.color_from || '#10b981',
                pointerEvents: 'auto',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Trophy className="w-4 h-4 text-yellow-400/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">
                    {achievement.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {achievement.person_name && (
                      <span className="text-xs text-slate-400">{achievement.person_name}</span>
                    )}
                    {achievement.team && achievement.person_name && (
                      <span className="text-xs text-slate-600">•</span>
                    )}
                    {achievement.team && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: achievement.team.color_from || '#10b981' }}
                      >
                        {achievement.team.name}
                      </span>
                    )}
                  </div>
                </div>
                <Sparkles className="w-3 h-3 text-emerald-400/60 flex-shrink-0" />
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-slate-800/95 border border-slate-700 rounded-lg z-50">
                <div className="text-sm font-semibold text-slate-100 mb-1">{achievement.title}</div>
                {achievement.description && (
                  <div className="text-xs text-slate-400 mb-2">{achievement.description}</div>
                )}
                <div className="text-[10px] text-slate-500">
                  {new Date(achievement.achieved_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for achievement details */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-semibold text-slate-100">{selectedAchievement.title}</h2>
            </div>

            {selectedAchievement.description && (
              <p className="text-slate-300 mb-4">{selectedAchievement.description}</p>
            )}

            <div className="space-y-2 mb-6">
              {selectedAchievement.person_name && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Achieved by:</span>
                  <span className="text-sm text-emerald-400 font-medium">{selectedAchievement.person_name}</span>
                </div>
              )}

              {selectedAchievement.team && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Team:</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: selectedAchievement.team.color_from || '#10b981' }}
                  >
                    {selectedAchievement.team.name}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Date:</span>
                <span className="text-sm text-slate-300">
                  {new Date(selectedAchievement.achieved_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedAchievement(null)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium py-2 px-4 rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </>
  );
}
