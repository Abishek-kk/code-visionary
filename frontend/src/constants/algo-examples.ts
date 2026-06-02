export const LANGUAGES = [
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "go", label: "Go" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const STARTER_CODE: Record<LanguageId, string> = {
  python: `def two_sum(nums, target):
    left, right = 0, len(nums) - 1
    nums.sort()
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return [left, right]
        elif s < target:
            left += 1
        else:
            right -= 1
    return []`,
  javascript: `function twoSum(nums, target) {
  nums.sort((a,b) => a-b);
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const s = nums[left] + nums[right];
    if (s === target) return [left, right];
    else if (s < target) left++;
    else right--;
  }
  return [];
}`,
  typescript: `function twoSum(nums: number[], target: number): number[] {
  nums.sort((a,b) => a-b);
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const s = nums[left] + nums[right];
    if (s === target) return [left, right];
    else if (s < target) left++;
    else right--;
  }
  return [];
}`,
  java: `public int[] twoSum(int[] nums, int target) {
  Arrays.sort(nums);
  int left = 0, right = nums.length - 1;
  while (left < right) {
    int s = nums[left] + nums[right];
    if (s == target) return new int[]{left, right};
    else if (s < target) left++;
    else right--;
  }
  return new int[]{};
}`,
  cpp: `vector<int> twoSum(vector<int>& nums, int target) {
  sort(nums.begin(), nums.end());
  int left = 0, right = nums.size() - 1;
  while (left < right) {
    int s = nums[left] + nums[right];
    if (s == target) return {left, right};
    else if (s < target) left++;
    else right--;
  }
  return {};
}`,
  go: `func twoSum(nums []int, target int) []int {
    sort.Ints(nums)
    left, right := 0, len(nums)-1
    for left < right {
        s := nums[left] + nums[right]
        if s == target { return []int{left, right} }
        if s < target { left++ } else { right-- }
    }
    return []int{}
}`,
};
