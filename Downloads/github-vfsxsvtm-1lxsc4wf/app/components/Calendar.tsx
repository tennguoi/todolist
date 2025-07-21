import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export default function Calendar({
  selectedDate = new Date(),
  onDateSelect = () => {},
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get the current date for highlighting
  const today = new Date();

  // Days of the week
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Get month name and year
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    setCurrentMonth(previousMonth);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  // Generate days for the current month view
  const generateDays = () => {
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const lastDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const days = generateDays();

  // Check if a day is selected
  const isSelectedDay = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  // Check if a day is today
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  // Handle day selection
  const handleDaySelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    onDateSelect(newDate);
  };

  return (
    <View className="bg-white rounded-lg p-4 shadow-sm w-full">
      {/* Month and Year Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">
          {monthName} {year}
        </Text>
        <View className="flex-row">
          <TouchableOpacity
            onPress={goToPreviousMonth}
            className="p-2 mr-2 rounded-full bg-gray-100"
          >
            <ChevronLeft size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goToNextMonth}
            className="p-2 rounded-full bg-gray-100"
          >
            <ChevronRight size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Days of Week Header */}
      <View className="flex-row justify-between mb-2">
        {daysOfWeek.map((day, index) => (
          <View key={index} className="w-8 h-8 items-center justify-center">
            <Text className="text-gray-500 font-medium">{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View className="flex-row flex-wrap">
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => day && handleDaySelect(day)}
            disabled={!day}
            className={`w-8 h-8 items-center justify-center mb-2 ${day ? "" : "opacity-0"}`}
          >
            <View
              className={`w-7 h-7 rounded-full items-center justify-center
                ${isSelectedDay(day) ? "bg-blue-500" : ""}
                ${isToday(day) && !isSelectedDay(day) ? "border border-blue-500" : ""}
              `}
            >
              <Text
                className={`${isSelectedDay(day) ? "text-white" : "text-gray-800"}
                  ${isToday(day) && !isSelectedDay(day) ? "text-blue-500" : ""}
                  font-medium
                `}
              >
                {day}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Current Date Display */}
      <View className="mt-4 border-t border-gray-200 pt-2">
        <Text className="text-center text-gray-600">
          {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}{" "}
          {selectedDate.getFullYear()}
        </Text>
      </View>
    </View>
  );
}
