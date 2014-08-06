#!/usr/bin/perl
$xpos = 0;
while(<>) {

  if (/=>/) {
    my @a = split(' ');
    $a[0] =~ s/\.png=>.*//;
    if ($a[2] =~ m/=>(\d+)x(\d+)$/) {
        $w=$1;
        $h=$2;
    }
    if ($a[3] =~ m/\+(\d+)\+(\d+)$/) {
      $x=$1;
      $y=$2;
    }
    print "'" . uc($a[0]) . "': ";
    print "{'x':" . $x . ", 'y':" . $y . ", 'w':" . $w .
    ", 'h':" . $h . ", 'offset':" . $xpos . "},\n";
    $xpos += $w;
  }

}
