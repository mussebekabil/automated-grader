export default {
  type: "object",
  properties: {
    courseCode: { type: 'string' },
    exerciseNumber: { type: 'string' },
    solution: { type: 'string' }
  },
  required: ['exerciseNumber', 'solution']
} as const;

